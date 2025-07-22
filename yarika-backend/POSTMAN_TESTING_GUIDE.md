# Postman Testing Guide for Yarika Orders

This guide will help you test all order-related endpoints using Postman.

## Prerequisites

1. **Backend Server Running**: Make sure your backend is running on `https://yarika.in`
2. **Postman Installed**: Download and install Postman
3. **Test Data**: You'll need valid product IDs, user credentials, and admin credentials

## 1. Authentication Setup

### Step 1: Create a User Account (if not exists)

**POST** `https://yarika.in/api/auth/signup`

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "testuser@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phoneNumber": "9876543210"
}
```

### Step 2: Login to Get User Token

**POST** `https://yarika.in/api/auth/login`

```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Response will contain:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client": {
    "id": "user_id_here",
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com"
  }
}
```

### Step 3: Login as Admin (if not exists)

**POST** `https://yarika.in/api/admin/login`

```json
{
  "email": "admin@yarika.com",
  "password": "admin123"
}
```

**Response will contain:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin_id_here",
    "name": "Admin",
    "email": "admin@yarika.com"
  }
}
```

## 2. Get Product IDs for Testing

### Get Available Products

**GET** `https://yarika.in/api/products`

**Headers:**
```
Authorization: Bearer YOUR_USER_TOKEN
```

**Response will show products with IDs:**
```json
[
  {
    "_id": "product_id_here",
    "name": "Product Name",
    "sellingPrice": 1500,
    "sizes": ["S", "M", "L"],
    "colors": ["Red", "Blue"],
    "totalStock": 10
  }
]
```

## 3. Test Order Creation

### Create Order After Payment

**POST** `https://yarika.in/api/orders/add`

**Headers:**
```
Authorization: Bearer YOUR_USER_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "quantity": 1,
      "price": 1500,
      "size": "M",
      "color": "Red"
    }
  ],
  "totalAmount": 1500,
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phoneNumber": "9876543210"
  }
}
```

**Expected Response:**
```json
{
  "_id": "order_id_here",
  "userId": "user_id_here",
  "items": [...],
  "totalAmount": 1500,
  "status": "Confirmed",
  "payment_status": "Completed",
  "shippingAddress": {...},
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 4. Test Order Retrieval

### Get User Orders

**GET** `https://yarika.in/api/orders`

**Headers:**
```
Authorization: Bearer YOUR_USER_TOKEN
```

### Get All Orders (Admin)

**GET** `https://yarika.in/api/orders/all`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Get Recent Orders (Admin)

**GET** `https://yarika.in/api/orders/recent`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## 5. Test Order Status Update

### Update Order Status

**PUT** `https://yarika.in/api/orders/ORDER_ID_HERE/status`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Processing"
}
```

**Valid Status Values:**
- "Pending"
- "Processing"
- "Shipped"
- "Delivered"
- "Cancelled"

## 6. Test Authentication Endpoints

### Test User Authentication

**GET** `https://yarika.in/api/orders/test-auth`

**Headers:**
```
Authorization: Bearer YOUR_USER_TOKEN
```

### Debug Routes

**GET** `https://yarika.in/api/orders/debug`

**No authentication required**

## 7. Test Error Cases

### Test Invalid Product ID

**POST** `https://yarika.in/api/orders/add`

**Body:**
```json
{
  "items": [
    {
      "productId": "invalid_id",
      "quantity": 1,
      "price": 1500,
      "size": "M",
      "color": "Red"
    }
  ],
  "totalAmount": 1500,
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

### Test Insufficient Stock

**POST** `https://yarika.in/api/orders/add`

**Body:**
```json
{
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "quantity": 999,
      "price": 1500,
      "size": "M",
      "color": "Red"
    }
  ],
  "totalAmount": 1500,
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

## 8. Environment Variables Setup

### Create Postman Environment

1. Click "Environments" in Postman
2. Create new environment called "Yarika Local"
3. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://yarika.in` | `https://yarika.in` |
| `user_token` | (empty) | (will be set after login) |
| `admin_token` | (empty) | (will be set after login) |
| `user_id` | (empty) | (will be set after login) |
| `product_id` | (empty) | (will be set after getting products) |
| `order_id` | (empty) | (will be set after creating order) |

### Using Environment Variables

**URL:** `{{base_url}}/api/orders/add`

**Headers:**
```
Authorization: Bearer {{user_token}}
```

**Body:**
```json
{
  "items": [
    {
      "productId": "{{product_id}}",
      "quantity": 1,
      "price": 1500,
      "size": "M",
      "color": "Red"
    }
  ],
  "totalAmount": 1500,
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

## 9. Testing Notifications

### Check SMS and Email Logs

After creating an order, check your backend console for:

```
Order confirmation SMS sent successfully: { orderId: ..., smsSid: ... }
Order confirmation email sent successfully: { orderId: ..., messageId: ... }
```

### Verify Email Configuration

If you see "Email service not configured", add to your `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 10. Common Issues and Solutions

### Issue: "Route not found"
- Check if backend server is running
- Verify the URL is correct
- Check if the route is properly registered

### Issue: "Authentication failed"
- Verify token is valid and not expired
- Check if token is in correct format: `Bearer TOKEN`
- Try logging in again to get a fresh token

### Issue: "Product not found"
- Get valid product IDs using GET `/api/products`
- Verify product exists and has stock

### Issue: "Insufficient stock"
- Check product stock using GET `/api/products`
- Reduce quantity in order

### Issue: "Validation failed"
- Check all required fields are present
- Verify data types (numbers, strings, etc.)
- Check if ObjectId format is correct

## 11. Complete Test Flow

1. **Start Backend**: `npm run dev`
2. **Create User**: POST `/api/auth/signup`
3. **Login User**: POST `/api/auth/login` → Save token
4. **Get Products**: GET `/api/products` → Save product ID
5. **Create Order**: POST `/api/orders/add` → Save order ID
6. **Verify Order**: GET `/api/orders`
7. **Login Admin**: POST `/api/admin/login` → Save admin token
8. **Update Status**: PUT `/api/orders/ORDER_ID/status`
9. **Check Notifications**: Monitor console logs

This completes the full testing flow for the order system! 