declare const Typography: {
    (): never;
    Heading1: import("react").FC<import("./Heading1").Heading1Props>;
    Heading2: import("react").FC<import("./Heading2").Heading2Props>;
    Heading3: import("react").FC<import("./Heading3").Heading3Props>;
    Heading4: import("react").FC<import("./Heading4").Heading4Props>;
    Heading5: import("react").FC<import("./Heading5").Heading5Props>;
    Heading6: import("react").FC<import("./Heading6").Heading6Props>;
    Paragraph: import("react").FC<import("react").HTMLAttributes<HTMLParagraphElement> & {
        children?: import("react").ReactNode | undefined;
    }>;
};
export { Typography };
