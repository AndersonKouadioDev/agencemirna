import Link from "next/link";
import React from "react";
import { buttonVariants } from "./button";

export default function ButtonBecomePartner() {
  return (
    <Link
      className={buttonVariants({
        variant: "default",
      })}
      href={"/become_partner"}
    >
      Devenir partenaire
    </Link>
  );
}
