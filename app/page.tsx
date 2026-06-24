import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Badge variant="soft" className="mb-6">
        DAYLIGHT
      </Badge>
      <h1 className="font-heading text-5xl font-semibold leading-tight text-text-primary">
        Fine jewellery, in daylight
      </h1>
      <p className="mt-5 max-w-prose font-body text-base text-text-secondary">
        Storefront scaffolding is in place. The design system is live and
        token-driven — preview it on the style guide.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button render={<Link href="/style-guide" />}>View the style guide</Button>
      </div>
    </main>
  );
}
