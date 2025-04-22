from database import SessionLocal
from models import User, Role
from auth import get_password_hash
from sqlalchemy.orm import Session

def create_admin():
    db: Session = SessionLocal()
    admin_role = db.query(Role).filter(Role.name == 'admin').first()
    if not admin_role:
        admin_role = Role(name='admin', description='Superuser with all permissions')
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)
    admin_user = db.query(User).filter(User.username == 'zakee').first()
    if not admin_user:
        admin_user = User(
            username='zakee',
            email='zakee@example.com',
            hashed_password=get_password_hash('zakee123'),
            is_active=True
        )
        admin_user.roles.append(admin_role)
        db.add(admin_user)
        db.commit()
        print('Superuser zakee created.')
    else:
        print('Superuser zakee already exists.')
    db.close()

if __name__ == "__main__":
    create_admin()
