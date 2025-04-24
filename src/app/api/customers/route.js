import  connectDB  from "../../../../server/db/connect";
import Order from "../../../../server/db/Orders";





export async function GET() {
  try {
    await connectDB();

    const customers = await Order.aggregate([
      {
        $group: {
          _id: {
            name: "$customerName",
            phone: "$customerPhone"
          },
          orderCount: { $sum: 1 }, 
          orders: {
            $push: {
              createdAt: "$createdAt", 
              products: "$products",
              totalAmount: "$totalAmount",
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          phone: "$_id.phone",
          orderCount: 1, 
          orders: 1
        }
      },
      {
        $sort: { createdAt: -1 } 
      }
    ]);

    const names = customers.map((customer) => customer.name);
    const phones = customers.map((customer) => customer.phone);

    return Response.json(
      {
        customers, // Full customer data including orderCount and orders
        names,
        phones
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching customer data:", error);

    // Return a meaningful error message
    return Response.json(
      { error: "Failed to fetch customer data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { name, phone } = await request.json();

    if (!name || !phone) {
      return Response.json(
        { error: "يرجى تعبئة جميع الحقول" },
        { status: 400 }
      );
    }

    const newOrder = new Order({
      customerName: name,
      customerPhone: phone,
      products: [],
      totalAmount: 0,
      createdAt: new Date()
    });

    await newOrder.save();
    return Response.json({ message: "تم إضافة العميل بنجاح" }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return Response.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const { name, phone, newName, newPhone } = await request.json();

    // Validate input
    if (!name || !phone || !newName || !newPhone) {
      return Response.json(
        { error: "يرجى تعبئة جميع الحقول" },
        { status: 400 }
      );
    }

    const updatedOrders = await Order.updateMany(
      { customerName: name, customerPhone: phone },
      { $set: { customerName: newName, customerPhone: newPhone } }
    );

    if (updatedOrders.modifiedCount === 0) {
      return Response.json(
        { error: "Customer not found or no changes made" },
        { status: 404 }
      );
    }

    return Response.json({ message: "تم تحديث بيانات العميل بنجاح" });
  } catch (error) {
    console.error("Error updating customer:", error);
    return Response.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a customer
export async function DELETE(request) {
  try {
    await connectDB();

    const { name, phone } = await request.json();

    // Validate input
    if (!name || !phone) {
      return Response.json(
        { error: "يرجى تعبئة جميع الحقول" },
        { status: 400 }
      );
    }

    // Delete all orders associated with the customer
    const deletedOrders = await Order.deleteMany({
      customerName: name,
      customerPhone: phone
    });

    if (deletedOrders.deletedCount === 0) {
      return Response.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return Response.json({ message: "تم حذف العميل بنجاح" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return Response.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
