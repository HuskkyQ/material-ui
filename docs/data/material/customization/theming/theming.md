# Theming

<p class="description">Customize MUI with your theme. You can change the colors, the typography and much more.</p>

The theme specifies the color of the components, darkness of the surfaces, level of shadow, appropriate opacity of ink elements, etc.

Themes let you apply a consistent tone to your app. It allows you to **customize all design aspects** of your project in order to meet the specific needs of your business or brand.

To promote greater consistency between apps, light and dark theme types are available to choose from. By default, components use the light theme type.

## Theme provider

If you wish to customize the theme, you need to use the `ThemeProvider` component in order to inject a theme into your application.
However, this is optional; MUI components come with a default theme.

`ThemeProvider` relies on the [context feature of React](https://reactjs.org/docs/context.html) to pass the theme down to the components, so you need to make sure that `ThemeProvider` is a parent of the components you are trying to customize.
You can learn more about this in [the API section](#themeprovider).

## Theme configuration variables

Changing the theme configuration variables is the most effective way to match MUI to your needs.
The following sections cover the most important theme variables:

- [`.palette`](/material-ui/customization/palette/)
- [`.typography`](/material-ui/customization/typography/)
- [`.spacing`](/material-ui/customization/spacing/)
- [`.breakpoints`](/material-ui/customization/breakpoints/)
- [`.zIndex`](/material-ui/customization/z-index/)
- [`.transitions`](/material-ui/customization/transitions/)
- [`.components`](/material-ui/customization/theme-components/)

You can check out the [default theme section](/material-ui/customization/default-theme/) to view the default theme in full.

### Custom variables

When using MUI's theme with [MUI System](/system/basics/) or [any other styling solution](/material-ui/guides/interoperability/#themeprovider), it can be convenient to add additional variables to the theme so you can use them everywhere.
For instance:

```jsx
const theme = createTheme({
  status: {
    danger: orange[500],
  },
});
```

If you are using TypeScript, you would also need to use [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) for the theme to accept the above values.

```tsx
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}
```

{{"demo": "CustomStyles.js"}}

## Theme builder

<video autoPlay muted loop width="320">
  <source src="/static/studies.mp4" type="video/mp4" >
</video>

The community has built great tools to build a theme:

- [mui-theme-creator](https://bareynol.github.io/mui-theme-creator/): A tool to help design and customize themes for the MUI component library. Includes basic site templates to show various components and how they are affected by the theme
- [Material palette generator](https://material.io/inline-tools/color/): The Material palette generator can be used to generate a palette for any color you input.

## Accessing the theme in a component

You [can access](/system/styles/advanced/#accessing-the-theme-in-a-component) the theme variables inside your React components.

## Nesting the theme

[You can nest](/system/styles/advanced/#theme-nesting) multiple theme providers.

{{"demo": "ThemeNesting.js"}}

The inner theme will **override** the outer theme.
You can extend the outer theme by providing a function:

{{"demo": "ThemeNestingExtend.js"}}

## API

### `createTheme(options, ...args) => theme`

Generate a theme base on the options received. Then, pass it as a prop to [`ThemeProvider`](#themeprovider).

#### Arguments

1. `options` (_object_): Takes an incomplete theme object and adds the missing parts.
2. `...args` (_object[]_): Deep merge the arguments with the about to be returned theme.

> Note: Only the first argument (`options`) is being processed by the `createTheme` function.
> If you want to actually merge two themes' options and create a new one based on them, you may want to deep merge the two options and provide them as a first argument to the `createTheme` function.

```js
import { deepmerge } from '@mui/utils';
import { createTheme } from '@mui/material/styles';

const theme = createTheme(deepmerge(options1, options2));
```

#### Returns

`theme` (_object_): A complete, ready-to-use theme object.

#### Examples

```js
import { createTheme } from '@mui/material/styles';
import { green, purple } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: green[500],
    },
  },
});
```

#### Theme composition: using theme options to define other options

When the value for a theme option is dependent on another theme option, you should compose the theme in steps.

```js
import { createTheme } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#0052cc',
    },
    secondary: {
      main: '#edf2ff',
    },
  },
});

theme = createTheme(theme, {
  palette: {
    info: {
      main: theme.palette.secondary.main,
    },
  },
});
```

Think of creating a theme as a two-step composition process: first, you define the basic design options; then, you'll use these design options to compose other options.

### `responsiveFontSizes(theme, options) => theme`

Generate responsive typography settings based on the options received.

#### Arguments

1. `theme` (_object_): The theme object to enhance.
2. `options` (_object_ [optional]):

- `breakpoints` (_array\<string\>_ [optional]): Default to `['sm', 'md', 'lg']`. Array of [breakpoints](/material-ui/customization/breakpoints/) (identifiers).
- `disableAlign` (_bool_ [optional]): Default to `false`. Whether font sizes change slightly so line
  heights are preserved and align to Material Design's 4px line height grid.
  This requires a unitless line height in the theme's styles.
- `factor` (_number_ [optional]): Default to `2`. This value determines the strength of font size resizing. The higher the value, the less difference there is between font sizes on small screens.
  The lower the value, the bigger font sizes for small screens. The value must be greater than 1.
- `variants` (_array\<string\>_ [optional]): Default to all. The typography variants to handle.

#### Returns

`theme` (_object_): The new theme with a responsive typography.

#### Examples

```js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme();
theme = responsiveFontSizes(theme);
```

### `unstable_createMuiStrictModeTheme(options, ...args) => theme`

**WARNING**: Do not use this method in production.

Generates a theme that reduces the amount of warnings inside [`React.StrictMode`](https://reactjs.org/docs/strict-mode.html) like `Warning: findDOMNode is deprecated in StrictMode`.

#### Requirements

Currently `unstable_createMuiStrictModeTheme` adds no additional requirements.

#### Arguments

1. `options` (_object_): Takes an incomplete theme object and adds the missing parts.
2. `...args` (_object[]_): Deep merge the arguments with the about to be returned theme.

#### Returns

`theme` (_object_): A complete, ready-to-use theme object.

#### Examples

```js
import { unstable_createMuiStrictModeTheme } from '@mui/material/styles';

const theme = unstable_createMuiStrictModeTheme();

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <LandingPage />
      </ThemeProvider>
    </React.StrictMode>
  );
}
```

### `ThemeProvider`

This component takes a `theme` prop and applies it to the entire React tree that it is wrapping around.
It should preferably be used at **the root of your component tree**.

#### Props

| Name             | Type                                     | Description                                                                                                                                                                                               |
| :--------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children&nbsp;\* | node                                     | Your component tree.                                                                                                                                                                                      |
| theme&nbsp;\*    | union:&nbsp;object&nbsp;&#124;&nbsp;func | A theme object, usually the result of [`createTheme()`](#createtheme-options-args-theme). The provided theme will be merged with the default theme. You can provide a function to extend the outer theme. |

#### Examples

```jsx
import * as React from 'react';
import ReactDOM from 'react-dom';
import { red } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: red[500],
    },
  },
});

function App() {
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}

ReactDOM.render(<App />, document.querySelector('#app'));
```
