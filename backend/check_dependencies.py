#!/usr/bin/env python3
"""
Check if all required dependencies are available
"""

import sys

def check_dependency(module_name, package_name=None):
    """Check if a module can be imported"""
    try:
        __import__(module_name)
        print(f"✓ {module_name} - OK")
        return True
    except ImportError as e:
        package = package_name or module_name
        print(f"✗ {module_name} - MISSING (install with: pip install {package})")
        print(f"  Error: {e}")
        return False

def main():
    print("Checking Python dependencies for DyslexoFly backend...\n")
    
    dependencies = [
        ("flask", "flask"),
        ("flask_cors", "flask-cors"),
        ("werkzeug", "werkzeug"),
        ("PyPDF2", "PyPDF2"),
        ("docx", "python-docx"),
        ("transformers", "transformers"),
        ("torch", "torch"),
        ("langdetect", "langdetect"),
        ("edge_tts", "edge-tts"),
        ("pyttsx3", "pyttsx3"),
        ("pdfplumber", "pdfplumber"),
        ("dotenv", "python-dotenv"),
    ]
    
    optional_dependencies = [
        ("magic", "python-magic"),
    ]
    
    print("Required dependencies:")
    missing_required = 0
    for module, package in dependencies:
        if not check_dependency(module, package):
            missing_required += 1
    
    print("\nOptional dependencies:")
    missing_optional = 0
    for module, package in optional_dependencies:
        if not check_dependency(module, package):
            missing_optional += 1
    
    print(f"\nSummary:")
    print(f"Required dependencies: {len(dependencies) - missing_required}/{len(dependencies)} available")
    print(f"Optional dependencies: {len(optional_dependencies) - missing_optional}/{len(optional_dependencies)} available")
    
    if missing_required > 0:
        print(f"\n⚠️  {missing_required} required dependencies are missing!")
        print("Please install them before running the backend.")
        return False
    else:
        print("\n✅ All required dependencies are available!")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)