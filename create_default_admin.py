#!/usr/bin/env python3
"""
Script to create a default admin user for Niko Free
This creates an admin with predefined credentials for initial setup.
Usage: python create_default_admin.py
"""

import sys
import os

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User

def create_default_admin():
    """Create a default admin user"""
    app = create_app()
    
    with app.app_context():
        # Default admin credentials
        admin_email = 'admin@nikofree.com'
        admin_password = 'Admin@1234'
        admin_first_name = 'System'
        admin_last_name = 'Administrator'
        
        print("=" * 60)
        print("Niko Free - Default Admin User Creation")
        print("=" * 60)
        print()
        
        # Check if admin already exists
        existing_user = User.query.filter_by(email=admin_email).first()
        if existing_user:
            if existing_user.is_admin:
                print(f"✓ Admin user with email {admin_email} already exists and is an admin.")
                print(f"\nAdmin credentials:")
                print(f"  Email: {admin_email}")
                print(f"  Password: [existing password]")
                return
            else:
                # Make existing user an admin
                existing_user.is_admin = True
                db.session.commit()
                print(f"✓ User {admin_email} is now an admin!")
                print(f"\nAdmin credentials:")
                print(f"  Email: {admin_email}")
                print(f"  Password: [existing password]")
                return
        
        # Create admin user
        admin_user = User(
            email=admin_email,
            first_name=admin_first_name,
            last_name=admin_last_name,
            is_admin=True,
            is_active=True,
            is_verified=True,
            email_verified=True,
            oauth_provider='email'
        )
        admin_user.set_password(admin_password)
        
        try:
            db.session.add(admin_user)
            db.session.commit()
            
            print("\n" + "=" * 60)
            print("✓ Default admin user created successfully!")
            print("=" * 60)
            print(f"\n⚠️  DEFAULT ADMIN CREDENTIALS:")
            print(f"  Email: {admin_email}")
            print(f"  Password: {admin_password}")
            print(f"\n⚠️  IMPORTANT: Please change the password after first login!")
            print("=" * 60)
            
        except Exception as e:
            db.session.rollback()
            print(f"\n✗ Error creating admin user: {str(e)}")
            return

if __name__ == '__main__':
    create_default_admin()

