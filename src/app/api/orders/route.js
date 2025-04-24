import { NextResponse } from 'next/server';
import Order from '../../../../server/db/Orders';
import  connectDB  from "../../../../server/db/connect";
import { Product } from '../../../../server/db/Product';




export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find().sort({ createdAt: -1 });
        return Response.json(orders);

    } catch (error) {
        return Response.json([], { status: 500 });
    }
}

export async function POST(request) {
    try {
        // توصيل قاعدة البيانات
        await connectDB();

        // استلام البيانات من الطلب
        const { products, totalAmount, customerName, customerPhone, invoiceNumber } = await request.json();
        console.log("Received data:", { products, totalAmount, customerName, customerPhone, invoiceNumber });

        // التحقق من المنتجات
        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json(
                    { error: `Product ${item.name} not found` },
                    { status: 404 }
                );
            }
            if (product.quantity < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient quantity for ${item.name}. Available: ${product.quantity}` },
                    { status: 400 }
                );
            }
        }

        // تحديث كميات المنتجات
        for (const item of products) {
            const updatedProduct = await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } },
                { new: true }
            );
            console.log(`Updated product ${item.name}:`, updatedProduct);
        }

        // إنشاء الطلب
        const newOrder = new Order({
            invoiceNumber, // إضافة رقم الفاتورة هنا
            products,
            totalAmount,
            customerName,
            customerPhone,
            status: 'completed',
            date: new Date()
        });

        await newOrder.save();
        console.log("Order created successfully:", newOrder);

        return NextResponse.json(
            { message: 'Order created successfully', order: newOrder },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating order:', error.message);
        return NextResponse.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}