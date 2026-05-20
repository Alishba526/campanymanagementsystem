'use client';

import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader-container">
        <section className="loader">
          {[...Array(9)].map((_, i) => (
            <article
              key={i}
              style={{ '--rot': i } as any}
              className={`sphere sphere${i + 1}`}
            >
              {[...Array(9)].map((_, j) => (
                <div
                  key={j}
                  className="item"
                  style={{ '--rot-y': j + 1 } as any}
                ></div>
              ))}
            </article>
          ))}
        </section>

        <h1 className="brand-name">GROWZIX</h1>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100vw;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #000;
  overflow: hidden;

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
  }

  .loader {
    position: relative;
    width: 400px;
    height: 400px;
    zoom: 0.5;

    animation: girar 8s linear infinite;
    transform-style: preserve-3d;
    perspective: 10000px;

    &,
    .sphere,
    .item {
      width: 400px;
      height: 400px;
      position: absolute;
      transform-style: preserve-3d;
      perspective: 10000px;
    }

    .sphere,
    .item {
      top: 0;
      left: 0;
    }

    .sphere {
      transform: rotate(calc(var(--rot) * 20deg));

      &.sphere1 {
        --bg: #f008;
      }

      &.sphere2 {
        --bg: #f0f8;
      }

      &.sphere3 {
        --bg: #ff08;
      }

      &.sphere4 {
        --bg: #0f08;
      }

      &.sphere5 {
        --bg: #0ff8;
      }

      &.sphere6 {
        --bg: #00f8;
      }

      &.sphere7 {
        --bg: #dc1ddf88;
      }

      &.sphere8 {
        --bg: #ffa50088;
      }

      &.sphere9 {
        --bg: #e5b2ca88;
      }
    }

    .item {
      border-radius: 50%;
      background: var(--bg);
      transform: rotateY(calc(var(--rot-y) * 40deg));
      box-shadow: 0 0 20px var(--bg);
    }
  }

  .brand-name {
    margin-top: 220px;

    font-size: 42px;
    font-weight: 800;
    letter-spacing: 10px;

    color: white;

    font-family: sans-serif;

    text-shadow:
      0 0 10px #fff,
      0 0 20px #0ff,
      0 0 40px #0ff;

    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes girar {
    0% {
      transform: rotateX(0deg) rotateY(0deg);
    }

    100% {
      transform: rotateX(360deg) rotateY(360deg);
    }
  }

  @keyframes glow {
    from {
      opacity: 0.7;
      transform: scale(1);
    }

    to {
      opacity: 1;
      transform: scale(1.05);
    }
  }
`;

export default Loader;