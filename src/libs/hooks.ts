import { ClosingDownType } from "@/services/token.type";
import { useEffect, RefObject } from "react";

type UseClickOutsideDropdownProps = {
  refs: { ref: RefObject<HTMLElement>; show: boolean; onClose: () => void }[];
  closingDelay?: number;
  setClosingDropdown?: (type: ClosingDownType) => void;
};

export const useClickOutsideDropdown = ({
  refs,
  closingDelay = 300,
  setClosingDropdown,
}: UseClickOutsideDropdownProps) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      refs.forEach(({ ref, show, onClose }) => {
        if (
          ref.current &&
          !ref.current.contains(event.target as Node) &&
          show
        ) {
          const type = ref.current.dataset.type as ClosingDownType;
          setClosingDropdown?.(type || null);
          setTimeout(() => {
            onClose();
            setClosingDropdown?.(null);
          }, closingDelay);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, closingDelay, setClosingDropdown]);
};
