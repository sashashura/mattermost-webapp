// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled, {keyframes} from 'styled-components';

const skeletonFade = keyframes`
    0% { 
        background-color: rgba(var(--center-channel-color-rgb), 0.08); 
    }
    50% { 
        background-color: rgba(var(--center-channel-color-rgb), 0.16); 
    }
    100% { 
        background-color: rgba(var(--center-channel-color-rgb), 0.08); 
    }
`;

const BaseLoader = styled.div`
    animation-duration: 1500ms;
    animation-iteration-count: infinite;
    animation-name: ${skeletonFade};
    animation-timing-function: ease-in-out;
    background-color: rgba(var(--center-channel-color-rgb), 0.08);
`;

interface CircleSkeletonLoaderProps {
    size: number;
}

export const CircleSkeletonLoader = styled(BaseLoader)<CircleSkeletonLoaderProps>`
    display: block;
    border-radius: 50%;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`;

interface RectangleSkeletonLoaderProps {
    height: number;
    width: number;
    borderRadius?: number;
}

export const RectangleSkeletonLoader = styled(BaseLoader)<RectangleSkeletonLoaderProps>`
    height: ${(props) => props.height}px;
    width: ${(props) => props.width}px;
    border-radius: ${(props) => props?.borderRadius ?? 8}px;
`;
