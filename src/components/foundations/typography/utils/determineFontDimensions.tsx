import { themeProps, FontSizes } from 'components/Theme';

/**
 * Determines font sizes based on the text type and size index.
 *
 * @param textType Either `text` or `heading`.
 * @param size The size key.
 */
export function determineFontDimensions(textType: keyof FontSizes, size: number = 400) {
  const match: any = (themeProps.fontSizes[textType] as any)[size];
  if(match) {
    if (textType === 'heading') {
      const styleProps = {
        fontSize: `${match.fontSize}px`,
        lineHeight: `${match.lineHeight}px`,
        // fontWeight: size <= 400 ? 600 : 500,
        fontWeight: 100,
        letterSpacing: `${match.letterSpacing}px`
      };

      return {
        ...styleProps,
        ...(size === 100 ? { textTransform: 'uppercase' } : {})
      };
    }

    return {
      fontSize: `${match.fontSize}px`,
      lineHeight: `${match.lineHeight}px`,
      fontWeight: 400
    };
  } else {
    return {
      fontSize: `16px`,
      lineHeight: `1.2`,
    }
  }
}
