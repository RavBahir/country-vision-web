import { SetStateAction } from "react";

interface ITogglerProps {
  state: boolean;
  setState: (value: SetStateAction<boolean>) => void;
  description?: string;
  title: string;
}

const CustomToggler = ({
  setState,
  state,
  title,
  description,
}: ITogglerProps) => {
  return (
    <label className="inline-flex cursor-pointer items-center border rounded-xl p-2 justify-between gap-3">
      <p className="text-sm font-medium flex flex-col text-gray-700">
        <span>{title}</span>
        <i className="text-[10px] font-normal">{description}</i>
      </p>

      <input
        type="checkbox"
        className="peer sr-only"
        checked={state}
        onChange={(e) => {
          setState(e.target.checked);
        }}
      />

      {/* Track + knob. The knob is an ::after so peer-checked can move it. */}
      <div className="relative h-6 w-11 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-black peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-red-400 peer-focus-visible:ring-offset-2" />
    </label>
  );
};

export default CustomToggler;
