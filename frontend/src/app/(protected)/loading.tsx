import { Spinner } from "@nextui-org/react";

export default function ProtectedLoading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <Spinner label="Loading..." color="secondary" size="lg" className="w-full h-full" />;
}
