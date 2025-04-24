import  connectDB  from "../../../../server/db/connect";
import { Product } from '../../../../server/db/Product';
import Order from '../../../../server/db/Orders';


export async function GET() {
  try {
    await connectDB();
    
    // Get product counts
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ quantity: { $gt: 10 } });
    const lowStockProducts = await Product.countDocuments({ quantity: { $gt: 0, $lte: 10 } });
    const outOfStockProducts = await Product.countDocuments({ quantity: { $lte: 0 } });
    
    const totalSales = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const uniqueCustomers = await Order.aggregate([
      { $group: { _id: { name: '$customerName', phone: '$customerPhone' } } }, 
      { $count: 'total' } 
    ]);

    const newCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } } },
      { $group: { _id: { name: '$customerName', phone: '$customerPhone' } } },
      { $count: 'new' } 
    ]);

    return Response.json({
      inventory: {
        available: availableProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      sales: {
        total: totalSales[0]?.total || 0,
        monthlyChange: 15 // This should be calculated based on your business logic
      },
      customers: {
        total: uniqueCustomers[0]?.total || 0, 
        new: newCustomers[0]?.new || 0 
      }
    });
    
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}