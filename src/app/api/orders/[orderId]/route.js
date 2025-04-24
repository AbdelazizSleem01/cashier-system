import connectDB  from "../../../../../server/db/connect";
import Order from "../../../../../server/db/Orders";


// delete order
export async function DELETE(request, { params }) {
    try {
        await connectDB();

        const { orderId } = await params;

        if (!orderId) {
            return Response.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return Response.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Restore product quantities if needed
        for (const item of deletedOrder.products) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: item.quantity } },
                { new: true }
            );
        }

        return Response.json(
            { message: "Order deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting order:", error);
        return Response.json(
            { error: "Failed to delete order" },
            { status: 500 }
        );
    }
}