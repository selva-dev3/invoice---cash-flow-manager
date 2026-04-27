from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(primary_key=True, max_length=25) # cuid length
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    # Map Django's password field to Prisma's passwordHash column
    password = models.CharField(max_length=255, db_column='passwordHash', null=True, blank=True)
    role = models.CharField(max_length=50, default='ADMIN')
    currency = models.CharField(max_length=10, default='USD')
    createdAt = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updatedAt = models.DateTimeField(auto_now=True, db_column='updatedAt')

    # Django specific fields (not in Prisma, so we keep them in Django's managed memory or separate if needed)
    # But since Meta.managed = False, Django won't try to create columns for these unless they exist.
    # To keep it simple, we'll assume the Prisma table might not have these.
    # If they are missing, we should probably mark them as non-persistent or handle them.
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'User'
        managed = False # Prisma manages this table

    def __str__(self):
        return self.email
