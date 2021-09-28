import styled, { css, keyframes } from 'styled-components';

const fullDivCss = css`
  width: 100%;
  height: 100%;
  outline: none;
  overflow: hidden;
`;

/**
 * A splitter with a solid background taking up the full hit area.
 */
export const SolidSplitter = styled.div`
  ${fullDivCss}
  background: #474757;
  cursor: col-resize;
`;

const stripeVars = css`
  --stripe-size: 50px;
  --color1: silver;
  --color2: gray;
  --duration: 2s;
`;

const verticalStripeAnimation = keyframes`
  ${stripeVars}
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(var(--stripe-size) * -1));
  }
`;

const horizontalStripeAnimation = keyframes`
  ${stripeVars}
  0% {
    transform: translateX(calc(var(--stripe-size) * -1));
  }
  100% {
    transform: translateX(0);
  }
`;

/**
 * An animated, striped splitter for left|right splits.
 */
export const VerticalStripedSplitter = styled.div`
  ${stripeVars}

  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% + var(--stripe-size));
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      var(--color2) 25%,
      var(--color2) 50%,
      var(--color1) 50%,
      var(--color1) 75%
    );
    background-size: var(--stripe-size) var(--stripe-size);
    animation: ${verticalStripeAnimation} var(--duration) linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(#1b2735, 0) 0%, #090a0f 100%);
  }
`;

/**
 * An animated, striped splitter for top/bottom splits.
 */
export const HorizontalStripedSplitter = styled.div`
  ${stripeVars}

  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% + var(--stripe-size));
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      var(--color2) 25%,
      var(--color2) 50%,
      var(--color1) 50%,
      var(--color1) 75%
    );
    background-size: var(--stripe-size) var(--stripe-size);
    animation: ${horizontalStripeAnimation} var(--duration) linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(#1b2735, 0) 0%, #090a0f 100%);
  }
`;
