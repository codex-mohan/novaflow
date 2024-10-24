import Router from "next/router";
import SigninPage from "./auth/signin/page";
import QueueBar from "@/components/ui/queuebar";

export default function Home() {
  return (
    <>
      <SigninPage></SigninPage>
    </>
  );
}
