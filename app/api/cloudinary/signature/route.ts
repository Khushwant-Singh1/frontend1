import { NextResponse } from "next/server";
import { generateSignature } from "@/lib/cloudinary";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    const { folder, publicId } = body;

    // Generate the signature for Cloudinary upload
    const signatureData = generateSignature(
      folder || 'freelancer-profiles',
      publicId
    );

    return NextResponse.json(signatureData);
  } catch (error) {
    console.log("[CLOUDINARY_SIGNATURE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
