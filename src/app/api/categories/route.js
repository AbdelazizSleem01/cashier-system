import { Category } from "../../../../server/db/Category";
import connectDB from "../../../../server/db/connect";



export async function GET(req) {
  await connectDB();
  const categories = await Category.find();
  return new Response(JSON.stringify(categories), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();
  try {
    const category = new Category({ name });
    await category.save();
    return new Response(JSON.stringify({ message: "Category created", category }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}


export async function PUT(req) {
  await connectDB();
  const { id, name } = await req.json();
  try {
    await Category.findByIdAndUpdate(id, { name });
    return new Response(JSON.stringify({ message: "Category Updated" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();
  try {
    await Category.findByIdAndDelete(id);
    return new Response(JSON.stringify({ message: "Category deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
