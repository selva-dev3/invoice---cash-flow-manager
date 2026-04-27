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
    id = models.CharField(primary_key=True, max_length=25)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    password = models.CharField(max_length=255, db_column='passwordHash', null=True, blank=True)
    last_login = models.DateTimeField(db_column='lastLogin', null=True, blank=True)
    role = models.CharField(max_length=50, default='ADMIN')
    currency = models.CharField(max_length=10, default='USD')
    createdAt = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updatedAt = models.DateTimeField(auto_now=True, db_column='updatedAt')

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'User'
        managed = False

    def __str__(self):
        return self.email

class UserSettings(models.Model):
    id = models.CharField(primary_key=True, max_length=25)
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='userId', related_name='settings')
    companyName = models.CharField(max_length=255, null=True, blank=True, db_column='companyName')
    logoUrl = models.CharField(max_length=255, null=True, blank=True, db_column='logoUrl')
    taxNumber = models.CharField(max_length=100, null=True, blank=True, db_column='taxNumber')
    address = models.TextField(null=True, blank=True)
    paymentTerms = models.CharField(max_length=100, default='Net 30', db_column='paymentTerms')
    invoicePrefix = models.CharField(max_length=50, default='INV-', db_column='invoicePrefix')
    nextNumber = models.IntegerField(default=1, db_column='nextNumber')

    class Meta:
        db_table = 'UserSettings'
        managed = False

class Client(models.Model):
    id = models.CharField(primary_key=True, max_length=25)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userId')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    createdAt = models.DateTimeField(auto_now_add=True, db_column='createdAt')

    class Meta:
        db_table = 'Client'
        managed = False

class Invoice(models.Model):
    id = models.CharField(primary_key=True, max_length=25)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userId')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, db_column='clientId')
    invoiceNumber = models.CharField(max_length=50, db_column='invoiceNumber')
    status = models.CharField(max_length=50, default='DRAFT')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    taxRate = models.DecimalField(max_digits=5, decimal_places=2, db_column='taxRate')
    taxAmount = models.DecimalField(max_digits=12, decimal_places=2, db_column='taxAmount')
    total = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10)
    issueDate = models.DateTimeField(db_column='issueDate')
    dueDate = models.DateTimeField(db_column='dueDate')
    notes = models.TextField(null=True, blank=True)
    portalToken = models.CharField(max_length=25, unique=True, db_column='portalToken')
    createdAt = models.DateTimeField(auto_now_add=True, db_column='createdAt')
    updatedAt = models.DateTimeField(auto_now=True, db_column='updatedAt')

    class Meta:
        db_table = 'Invoice'
        managed = False

class InvoiceItem(models.Model):
    id = models.CharField(primary_key=True, max_length=25)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, db_column='invoiceId', related_name='items')
    description = models.TextField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unitPrice = models.DecimalField(max_digits=12, decimal_places=2, db_column='unitPrice')
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'InvoiceItem'
        managed = False

class Expense(models.Model):
    id = models.CharField(primary_key=True, max_length=25)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userId')
    category = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10)
    expenseDate = models.DateTimeField(db_column='expenseDate')
    receiptUrl = models.CharField(max_length=255, null=True, blank=True, db_column='receiptUrl')
    createdAt = models.DateTimeField(auto_now_add=True, db_column='createdAt')

    class Meta:
        db_table = 'Expense'
        managed = False
