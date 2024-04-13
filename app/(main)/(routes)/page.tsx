import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="">
      <p> restricted area</p>
      <UserButton
        afterSignOutUrl = "/"
      >
      </UserButton>
      <ModeToggle />
    </div>
  );
}
