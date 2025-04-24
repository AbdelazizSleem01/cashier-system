import connectDB from "../../../../server/db/connect";
import { Invoice } from "../../../../server/db/Invoice";



export async function GET(req) {
  try {
    await connectDB();
    const invoices = await Invoice.find().populate("items.product");
    return new Response(JSON.stringify(invoices), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch invoices", details: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { items, total } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Items array is required and cannot be empty" }),
        { status: 400 }
      );
    }

    if (typeof total !== "number" || total <= 0) {
      return new Response(
        JSON.stringify({ error: "Total must be a positive number" }),
        { status: 400 }
      );
    }

    // توليد رقم فاتورة فريد
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const invoice = new Invoice({
      invoiceNumber,
      items,
      total,
    });

    await invoice.save();
    return new Response(JSON.stringify(invoice), { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to create invoice", details: error.message }),
      { status: 500 }
    );
  }
}