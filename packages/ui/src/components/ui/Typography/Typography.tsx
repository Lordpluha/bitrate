import { Heading1 } from "./Heading1";
import { Heading2 } from "./Heading2";
import { Heading3 } from "./Heading3";
import { Heading4 } from "./Heading4";
import { Heading5 } from "./Heading5";
import { Heading6 } from "./Heading6";
import { Paragraph } from "./Paragraph";

const Typography = () => {
  throw new Error("Can't use typography without inner elements");
};

Typography.Heading1 = Heading1;
Typography.Heading2 = Heading2;
Typography.Heading3 = Heading3;
Typography.Heading4 = Heading4;
Typography.Heading5 = Heading5;
Typography.Heading6 = Heading6;
Typography.Paragraph = Paragraph;

export { Typography };
