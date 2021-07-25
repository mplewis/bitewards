type PadSide = "left" | "right";

// pad pads a string on a given side with 0s to a given length.
export function pad(side: PadSide, len: number, s: string): string {
  let v = s.slice();
  if (v.length > len)
    throw new Error(`Value ${v} is already longer than desired length ${len}`);
  while (v.length < len) {
    if (side == "left") v = "0" + v;
    else v = v + "0";
  }
  return v;
}

// pad pads a string on a given side with 0s until it matches the given modulo size.
export function padMod(side: PadSide, mod: number, s: string): string {
  const mul = Math.ceil(s.length / mod);
  return pad(side, mod * mul, s);
}

// groupsOf splits a string into an array of strings of the given length.
export function groupsOf(size: number, s: string): string[] {
  if (s.length % size !== 0)
    throw new Error(
      `String ${s} cannot be split evenly into chunks of ${size}`
    );
  let g = [];
  for (let x = 0; x < s.length; x += size) g.push(s.slice(x, x + size));
  return g;
}
