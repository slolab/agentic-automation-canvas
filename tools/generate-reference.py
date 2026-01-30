#!/usr/bin/env python3
"""
Generate reference documentation from JSON Schema.

This script parses the AAC JSON Schema and generates Markdown reference
documentation for each main type/object in the schema.
"""

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set


def escape_markdown(text: str) -> str:
    """Escape special Markdown characters."""
    return text.replace("|", "\\|").replace("*", "\\*").replace("_", "\\_")


def format_type_name(type_name: str) -> str:
    """Format a type name preserving camelCase and converting underscores to spaces."""
    # Split by underscores first
    parts = type_name.split("_")
    
    # Format each part: preserve camelCase if present
    formatted_parts = []
    for part in parts:
        if not part:
            continue
        
        # Check if it's camelCase (has lowercase followed by uppercase)
        # e.g., "AggregateBenefit" has 'e' followed by 'B', "dataAccess" has 'a' followed by 'A'
        is_camel_case = any(
            i > 0 and part[i-1].islower() and part[i].isupper() 
            for i in range(1, len(part))
        )
        
        if is_camel_case:
            # Preserve camelCase - just capitalize first letter if needed
            if part[0].islower():
                formatted_parts.append(part[0].upper() + part[1:])
            else:
                formatted_parts.append(part)
        else:
            # Not camelCase - capitalize first letter, lowercase rest
            formatted_parts.append(part[0].upper() + part[1:].lower() if part else part)
    
    return " ".join(formatted_parts)


def format_type(schema: Dict[str, Any], defs: Dict[str, Any] = None) -> str:
    """Format the type information from a schema."""
    if "$ref" in schema:
        # Resolve reference
        ref_path = schema["$ref"]
        if ref_path.startswith("#/$defs/"):
            ref_name = ref_path.replace("#/$defs/", "")
            if defs and ref_name in defs:
                # Check if it's a oneOf type (like BenefitValue) - don't link
                ref_schema = defs[ref_name]
                if "oneOf" in ref_schema:
                    return ref_name
                # Use anchor link within the same page instead of separate .md file
                anchor = ref_name.lower().replace("_", "-")
                return f"[{ref_name}](#{anchor})"
            return ref_name
        return ref_path
    
    if "type" in schema:
        if isinstance(schema["type"], list):
            return " | ".join(schema["type"])
        schema_type = schema["type"]
        
        # Handle array types
        if schema_type == "array" and "items" in schema:
            items_type = format_type(schema["items"], defs)
            return f"array of {items_type}"
        
        return schema_type
    
    if "oneOf" in schema:
        return "oneOf"
    if "anyOf" in schema:
        return "anyOf"
    if "allOf" in schema:
        return "allOf"
    return "object"


def format_constraints(schema: Dict[str, Any]) -> str:
    """Format constraints (enum, pattern, min, max, etc.) from a schema."""
    constraints = []
    
    if "enum" in schema:
        enum_values = ", ".join(f"`{v}`" for v in schema["enum"])
        constraints.append(f"Enum: {enum_values}")
    
    if "pattern" in schema:
        constraints.append(f"Pattern: `{schema['pattern']}`")
    
    if "minimum" in schema:
        constraints.append(f"Minimum: {schema['minimum']}")
    
    if "maximum" in schema:
        constraints.append(f"Maximum: {schema['maximum']}")
    
    if "minLength" in schema:
        constraints.append(f"Min length: {schema['minLength']}")
    
    if "maxLength" in schema:
        constraints.append(f"Max length: {schema['maxLength']}")
    
    if "format" in schema:
        constraints.append(f"Format: `{schema['format']}`")
    
    if "default" in schema:
        constraints.append(f"Default: `{schema['default']}`")
    
    return "<br>".join(constraints) if constraints else ""


# Mapping of generic fields to their underlying ontologies
ONTOLOGY_MAPPINGS = {
    # Schema.org mappings
    "title": "schema:name",
    "name": "schema:name",
    "description": "schema:description",
    "objective": "schema:abstract",
    "startDate": "schema:startDate",
    "endDate": "schema:endDate",
    "keywords": "schema:keywords",
    "projectId": "schema:identifier",
    "identifier": "schema:identifier",
    "pid": "schema:identifier",
    "doi": "schema:identifier",
    "license": "schema:license",
    "publisher": "schema:publisher",
    "author": "schema:author",
    "authors": "schema:author",
    "date": "schema:datePublished",
    "datePublished": "schema:datePublished",
    "format": "schema:encodingFormat",
    "affiliation": "schema:affiliation",
    "orcid": "schema:identifier",
    
    # DCAT mappings
    "accessRights": "dct:accessRights",
    "duoTerms": "dct:conformsTo",
    
    # PROV-O mappings
    "startedAtTime": "prov:startedAtTime",
    "endedAtTime": "prov:endedAtTime",
    "wasAssociatedWith": "prov:wasAssociatedWith",
    "wasGeneratedBy": "prov:wasGeneratedBy",
    "wasInformedBy": "prov:wasInformedBy",
    "hadPlan": "prov:hadPlan",
    
    # P-Plan mappings
    "requirements": "p-plan:hasStep",
    "milestones": "p-plan:hasMilestone",
    "userStory": "p-plan:Step",
    
    # FRAPO mappings
    "fundingGrant": "frapo:fundingGrant",
    "leadOrganization": "frapo:leadOrganization",
    "projectStage": "frapo:hasStatus",
    "deliverables": "frapo:deliverable",
    
    # Custom AAC fields (no ontology mapping)
    "headlineValue": None,
    "aggregateBenefitValue": None,
    "aggregateBenefitUnit": None,
    "primaryValueDriver": None,
    "aggregateBenefits": None,
    "version": None,
    "versionDate": None,
    "isImported": None,
    "benefitType": None,
    "metricId": None,
    "metricLabel": None,
    "direction": None,
    "valueMeaning": None,
    "benefitUnit": None,
    "baseline": None,
    "expected": None,
    "confidenceUser": None,
    "confidenceDev": None,
    "assumptions": None,
    "aggregationBasis": None,
    "unitOfWork": None,
    "unitCategory": None,
    "volumePerMonth": None,
    "humanOversightMinutesPerUnit": None,
    "roleContext": None,
    "containsPersonalData": None,
    "sensitivityLevel": None,
    "evaluationType": None,
    "metrics": None,
    "complianceStandard": None,
}


def get_ontology_note(prop_name: str, prop_type: str = None) -> str:
    """Get ontology mapping note for a property."""
    # Check if property has an explicit ontology mapping first
    ontology = ONTOLOGY_MAPPINGS.get(prop_name)
    if ontology:
        # Extract ontology prefix
        if ontology.startswith("schema:"):
            return "Schema.org"
        elif ontology.startswith("dct:"):
            return "DCAT/Dublin Core"
        elif ontology.startswith("prov:"):
            return "PROV-O"
        elif ontology.startswith("p-plan:"):
            return "P-Plan"
        elif ontology.startswith("frapo:"):
            return "FRAPO"
        elif ontology.startswith("duo:"):
            return "DUO"
        else:
            return ontology
    
    # For complex object types without explicit mapping, indicate they're containers
    if prop_type and prop_type in ["object", "array of object"]:
        return "—"  # Use em dash to indicate N/A for containers
    
    # Default: custom AAC field (no ontology mapping)
    return "AAC"


def generate_property_table(properties: Dict[str, Any], required: List[str], defs: Dict[str, Any] = None) -> str:
    """Generate a Markdown table for object properties."""
    lines = [
        "| Property | Type | Required | Description | Constraints | Ontology |",
        "|----------|------|----------|-------------|-------------|----------|"
    ]
    
    for prop_name, prop_schema in sorted(properties.items()):
        prop_type = format_type(prop_schema, defs)
        is_required = "Yes" if prop_name in required else "No"
        description = prop_schema.get("description", "").replace("\n", " ")
        constraints = format_constraints(prop_schema)
        ontology_note = get_ontology_note(prop_name, prop_type)
        
        lines.append(
            f"| `{prop_name}` | {prop_type} | {is_required} | "
            f"{escape_markdown(description)} | {constraints} | {ontology_note} |"
        )
    
    return "\n".join(lines)


def resolve_ref(schema: Dict[str, Any], defs: Dict[str, Any]) -> Dict[str, Any]:
    """Resolve a $ref reference to the actual schema."""
    if "$ref" in schema:
        ref_path = schema["$ref"]
        if ref_path.startswith("#/$defs/"):
            ref_name = ref_path.replace("#/$defs/", "")
            if ref_name in defs:
                return defs[ref_name]
    return schema


def extract_nested_types(properties: Dict[str, Any], defs: Dict[str, Any], type_name: str, seen: Set[str]) -> Dict[str, Dict[str, Any]]:
    """Extract nested object types from properties."""
    nested_types = {}
    
    for prop_name, prop_schema in properties.items():
        prop_schema = resolve_ref(prop_schema, defs)
        
        # Skip if this is just a reference to a $def (we'll document $defs separately)
        if "$ref" in prop_schema:
            continue
        
        # Handle arrays
        if prop_schema.get("type") == "array" and "items" in prop_schema:
            # Skip if items is just a reference to a $def
            if "$ref" in prop_schema.get("items", {}):
                continue
            items_schema = resolve_ref(prop_schema["items"], defs)
            if items_schema.get("type") == "object" and "properties" in items_schema:
                nested_name = f"{type_name}_{prop_name.rstrip('s')}"  # Remove plural
                # Skip if this would duplicate a $def
                if nested_name.lower() in [d.lower() for d in defs.keys()]:
                    continue
                if nested_name not in seen and nested_name not in nested_types:
                    nested_types[nested_name] = items_schema
                    seen.add(nested_name)
                    # Recursively extract nested types
                    nested_types.update(extract_nested_types(items_schema["properties"], defs, nested_name, seen))
        
        # Handle direct objects
        elif prop_schema.get("type") == "object" and "properties" in prop_schema:
            nested_name = f"{type_name}_{prop_name}"
            # Skip if this would duplicate a $def
            if nested_name.lower() in [d.lower() for d in defs.keys()]:
                continue
            if nested_name not in seen and nested_name not in nested_types:
                nested_types[nested_name] = prop_schema
                seen.add(nested_name)
                # Recursively extract nested types
                nested_types.update(extract_nested_types(prop_schema["properties"], defs, nested_name, seen))
    
    return nested_types


def generate_type_doc(type_name: str, type_schema: Dict[str, Any], defs: Dict[str, Any], output_dir: Path) -> None:
    """Generate documentation for a type."""
    title = format_type_name(type_name)
    description = type_schema.get("description", "")
    properties = type_schema.get("properties", {})
    required = type_schema.get("required", [])
    
    content = f"# {title}\n\n"
    
    if description:
        content += f"{description}\n\n"
    
    if properties:
        content += "## Properties\n\n"
        content += generate_property_table(properties, required, defs)
        content += "\n"
    
    output_file = output_dir / f"{type_name.lower()}.md"
    output_file.write_text(content, encoding="utf-8")
    print(f"Generated: {output_file}")


def generate_defs_docs(defs: Dict[str, Any], output_dir: Path) -> None:
    """Generate documentation for schema definitions."""
    for def_name, def_schema in sorted(defs.items()):
        # Skip oneOf types (like BenefitValue) - they don't have properties
        if "oneOf" in def_schema:
            continue
        
        if def_schema.get("type") != "object":
            continue
        
        generate_type_doc(def_name, def_schema, defs, output_dir)


def generate_type_section(type_name: str, type_schema: Dict[str, Any], defs: Dict[str, Any]) -> str:
    """Generate a section for a type (for inclusion in main reference page)."""
    title = format_type_name(type_name)
    description = type_schema.get("description", "")
    properties = type_schema.get("properties", {})
    required = type_schema.get("required", [])
    
    content = f"\n## {title}\n\n"
    
    if description:
        content += f"{description}\n\n"
    
    if properties:
        content += generate_property_table(properties, required, defs)
        content += "\n"
    
    return content


def generate_main_types_docs(schema: Dict[str, Any], output_dir: Path) -> None:
    """Generate documentation for main schema types."""
    properties = schema.get("properties", {})
    required = schema.get("required", [])
    defs = schema.get("$defs", {})
    
    # Extract nested types from main properties
    seen = set()
    nested_types = {}
    
    # Main object types to document
    main_types = {
        "project": "Project",
        "userExpectations": "User Expectations",
        "developerFeasibility": "Developer Feasibility",
        "governance": "Governance",
        "dataAccess": "Data Access",
        "outcomes": "Outcomes",
        "persons": "Person"
    }
    
    for prop_name, prop_schema in properties.items():
        prop_schema = resolve_ref(prop_schema, defs)
        
        # Handle arrays (like persons)
        if prop_schema.get("type") == "array" and "items" in prop_schema:
            items_schema = resolve_ref(prop_schema["items"], defs)
            if items_schema.get("type") == "object":
                type_name = prop_name.rstrip("s")  # Remove plural
                nested_types[type_name] = items_schema
                seen.add(type_name)
                # Extract nested types
                if "properties" in items_schema:
                    nested_types.update(extract_nested_types(items_schema["properties"], defs, type_name, seen))
        
        # Handle direct objects
        elif prop_schema.get("type") == "object" and prop_name in main_types:
            nested_types[prop_name] = prop_schema
            seen.add(prop_name)
            # Extract nested types
            if "properties" in prop_schema:
                nested_types.update(extract_nested_types(prop_schema["properties"], defs, prop_name, seen))
    
    # Generate main schema overview with all types as sections
    content = "# Schema Reference\n\n"
    content += "This section provides detailed reference documentation for all types and properties in the AAC schema.\n\n"
    
    content += "!!! info \"Ontology Alignment\"\n"
    content += "    The reference tables include an **Ontology** column indicating which standard vocabulary each generic field maps to. Fields marked with an ontology (e.g., \"Schema.org\", \"DCAT/Dublin Core\") align with established standards. Complex object types show \"—\" (not applicable). Custom AAC-specific fields are marked with \"AAC\". See the [schema ontology alignment](../schema/index.md#ontology-alignment) section for more details.\n\n"
    
    content += "## Main Schema Properties\n\n"
    content += generate_property_table(properties, required, defs)
    content += "\n"
    
    # Collect all types (nested + defs) for sorting
    all_types = {}
    
    # Add nested types
    for type_name, type_schema in nested_types.items():
        all_types[type_name] = type_schema
    
    # Add $defs types
    for def_name, def_schema in defs.items():
        if def_name not in ["BenefitValue"]:  # Skip oneOf types
            if def_schema.get("type") == "object":
                all_types[def_name] = def_schema
    
    # Generate sections for all types, sorted alphabetically
    for type_name in sorted(all_types.keys()):
        type_schema = all_types[type_name]
        content += generate_type_section(type_name, type_schema, defs)
    
    # Ensure file ends with newline
    content = content.rstrip() + "\n"
    
    output_file = output_dir / "index.md"
    output_file.write_text(content, encoding="utf-8")
    print(f"Generated: {output_file}")


def main():
    """Main entry point."""
    # Get paths
    repo_root = Path(__file__).parent.parent
    schema_file = repo_root / "schema" / "canvas-schema.json"
    output_dir = repo_root / "docs" / "reference"
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load schema
    if not schema_file.exists():
        print(f"Error: Schema file not found: {schema_file}", file=sys.stderr)
        sys.exit(1)
    
    with open(schema_file, "r", encoding="utf-8") as f:
        schema = json.load(f)
    
    # Generate main types documentation (includes nested types as sections in single page)
    generate_main_types_docs(schema, output_dir)
    
    print(f"\nReference documentation generated in: {output_dir}")


if __name__ == "__main__":
    main()
