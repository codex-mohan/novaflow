import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const { username, fullName, email, password } = await request.json();

  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Insert a new profile for the user
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: data.user?.id,
      username,
      email,
    });

    if (profileError) throw profileError;

    return NextResponse.json(
      { message: "User created successfully", user: data.user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
