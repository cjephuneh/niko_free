#!/usr/bin/env python3
"""
Script to create an admin user for Niko Free
Usage: python create_admin.py
"""

import sys
import os
from getpass import getpass

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User

def create_admin_user():
    """Create an admin user"""
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("Niko Free - Admin User Creation")
        print("=" * 60)
        print()
        
        # Get admin details
        email = input("Enter admin email: ").strip().lower()
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"\nUser with email {email} already exists.")
            response = input("Do you want to make this user an admin? (y/n): ").strip().lower()
            if response == 'y':
                existing_user.is_admin = True
                db.session.commit()
                print(f"\n✓ User {email} is now an admin!")
                print(f"\nAdmin credentials:")
                print(f"  Email: {email}")
                print(f"  Password: [existing password]")
                return
            else:
                print("Operation cancelled.")
                return
        
        # Get other details
        first_name = input("Enter first name: ").strip()
        last_name = input("Enter last name: ").strip()
        password = getpass("Enter password: ")
        confirm_password = getpass("Confirm password: ")
        
        if password != confirm_password:
            print("\n✗ Passwords do not match!")
            return
        
        if len(password) < 8:
            print("\n✗ Password must be at least 8 characters!")
            return
        
        # Create admin user
        admin_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_admin=True,
            is_active=True,
            is_verified=True,
            email_verified=True,
            oauth_provider='email'
        )
        admin_user.set_password(password)
        
        try:
            db.session.add(admin_user)
            db.session.commit()
            
            print("\n" + "=" * 60)
            print("✓ Admin user created successfully!")
            print("=" * 60)
            print(f"\nAdmin credentials:")
            print(f"  Email: {email}")
            print(f"  Password: {password}")
            print(f"\n⚠️  Please save these credentials securely!")
            print("=" * 60)
            
        except Exception as e:
            db.session.rollback()
            print(f"\n✗ Error creating admin user: {str(e)}")
            return

if __name__ == '__main__':
    create_admin_user()

