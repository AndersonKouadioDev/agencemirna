import Link from "next/link";
import React from "react";
import { buttonVariants } from "./button";

export default function ButtonDownloadApp() {
  return (
    <Link
      className={buttonVariants()}
      href={"/downloard_app"}
    >
      Télécharger l&apos;application
    </Link>
  );
}
