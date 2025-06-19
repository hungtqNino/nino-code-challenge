import { ShimmerDiv, TokenOption } from "@/components/shared";

export const ShimmerLoadingOption = () => (
  <>
    {[1, 2, 3, 4].map((index) => (
      <TokenOption key={index} as="div" style={{ cursor: "default" }}>
        <ShimmerDiv />
      </TokenOption>
    ))}
  </>
);
