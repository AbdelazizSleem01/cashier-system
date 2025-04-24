import  connectDB  from "../../../../server/db/connect";
import { NextResponse } from "next/server";
import { Product } from "../../../../server/db/Product";



export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().populate("category");
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

function generateBarcode() {
  return 'PROD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export async function POST(request) {
  try {
    await connectDB();
    const { name, description, price, quantity, category, barcode } = await request.json();

    const product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      barcode: barcode || generateBarcode()
    });

    await product.save();
    const populatedProduct = await product.populate("category"); 

    return NextResponse.json(product, populatedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { name, description, price, quantity, category, barcode } = await request.json();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, quantity, category, barcode },
      { new: true }
    ).populate("category");

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
