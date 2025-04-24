import  connectDB  from "../../../../server/db/connect";
import PurchaseInvoice from "../../../../server/db/PurchaseInvoice";


export async function GET() {
  try {
    await connectDB();
    const invoices = await PurchaseInvoice.find().sort({ createdAt: -1 });
    return Response.json(invoices);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch purchase invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const invoiceData = await request.json();

    // Validate required fields
    if (
      !invoiceData.supplier?.name ||
      !invoiceData.creatorName ||
      !invoiceData.creatorId ||
      !Array.isArray(invoiceData.products) ||
      invoiceData.products.length === 0
    ) {
      return Response.json(
        { error: 'Missing required fields: supplier name, creator details, or products' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const lastInvoice = await PurchaseInvoice.findOne().sort({ createdAt: -1 });
    const nextNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1], 10) + 1 : 1;
    const invoiceNumber = `INV-${nextNumber.toString().padStart(5, '0')}`;

    // Create new invoice
    const newInvoice = new PurchaseInvoice({
      ...invoiceData,
      invoiceNumber,
      status: 'مكتمل'
    });

    await newInvoice.save();
    return Response.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error saving invoice:', error);
    return Response.json({ error: 'Failed to create purchase invoice' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const { id, updatedData } = await request.json();

    // Validate ID
    if (!id) {
      return Response.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Validate required fields
    if (
      !updatedData.supplier?.name ||
      !updatedData.creatorName ||
      !updatedData.creatorId ||
      !Array.isArray(updatedData.products) ||
      updatedData.products.length === 0
    ) {
      return Response.json(
        { error: 'Missing required fields: supplier name, creator details, or products' },
        { status: 400 }
      );
    }

    // Update invoice
    const updatedInvoice = await PurchaseInvoice.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedInvoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return Response.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return Response.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { id } = await request.json();

    // Validate ID
    if (!id) {
      return Response.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Delete invoice
    const deletedInvoice = await PurchaseInvoice.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return Response.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return Response.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
