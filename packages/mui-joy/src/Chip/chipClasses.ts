import { generateUtilityClass, generateUtilityClasses } from '@mui/base';

export interface ChipClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `color="primary"`. */
  colorPrimary: string;
  /** Styles applied to the root element if `color="neutral"`. */
  colorNeutral: string;
  /** Styles applied to the root element if `color="danger"`. */
  colorDanger: string;
  /** Styles applied to the root element if `color="info"`. */
  colorInfo: string;
  /** Styles applied to the root element if `color="success"`. */
  colorSuccess: string;
  /** Styles applied to the root element if `color="warning"`. */
  colorWarning: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
  /** Styles applied to the endDecorator element if supplied. */
  endDecorator: string;
  /** State class applied to the root element if keyboard focused. */
  focusVisible: string;
  /** Styles applied to the label `span` element. */
  label: string;
  /** Styles applied to the label `span` element if `size="sm"`. */
  labelSm: string;
  /** Styles applied to the label `span` element if `size="md"`. */
  labelMd: string;
  /** Styles applied to the label `span` element if `size="lg"`. */
  labelLg: string;
  /** Styles applied to the root element if `size="sm"`. */
  sizeSm: string;
  /** Styles applied to the root element if `size="md"`. */
  sizeMd: string;
  /** Styles applied to the root element if `size="lg"`. */
  sizeLg: string;
  /** Styles applied to the startDecorator element if supplied. */
  startDecorator: string;
  /** Styles applied to the root element if `variant="contained"`. */
  variantContained: string;
  /** Styles applied to the root element if `variant="light"`. */
  variantLight: string;
  /** Styles applied to the root element if `variant="outlined"`. */
  variantOutlined: string;
}

export type ChipClassKey = keyof ChipClasses;

export function getChipUtilityClass(slot: string): string {
  return generateUtilityClass('MuiChip', slot);
}

const chipClasses: ChipClasses = generateUtilityClasses('MuiChip', [
  'root',
  'clickable',
  'colorPrimary',
  'colorNeutral',
  'colorDanger',
  'colorInfo',
  'colorSuccess',
  'colorWarning',
  'disabled',
  'endDecorator',
  'focusVisible',
  'label',
  'labelSm',
  'labelMd',
  'labelLg',
  'sizeSm',
  'sizeMd',
  'sizeLg',
  'startDecorator',
  'variantContained',
  'variantLight',
  'variantOutlined',
]);

export default chipClasses;
