import React, {memo, useCallback, useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {GestureStateChangeEvent, GestureUpdateEvent, PanGestureChangeEventPayload, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedStyle} from 'react-native-reanimated';
import Hoverable from '@components/Hoverable';
import * as Expensicons from '@components/Icon/Expensicons';
import IconButton from '@components/VideoPlayer/IconButton';
import {useVolumeContext} from '@components/VideoPlayerContexts/VolumeContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as NumberUtils from '@libs/NumberUtils';
import {usePlaybackContext} from "@components/VideoPlayerContexts/PlaybackContext";

type VolumeButtonProps = {
    /** Style for the volume button. */
    style?: StyleProp<ViewStyle>;

    /** Is button icon small. */
    small?: boolean;
};

const getVolumeIcon = (volume: number) => {
    if (volume === 0) {
        return Expensicons.Mute;
    }
    if (volume <= 0.5) {
        return Expensicons.VolumeLow;
    }
    return Expensicons.VolumeHigh;
};

function VolumeButton({style, small = false}: VolumeButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateVolume, volume, isMuted, setIsMuted} = useVolumeContext();
    const [sliderHeight, setSliderHeight] = useState(1);
    const [volumeIcon, setVolumeIcon] = useState({icon: getVolumeIcon(isMuted ? 0 : volume.value)});
    const [isSliderBeingUsed, setIsSliderBeingUsed] = useState(false);
    const {currentVideoPlayerRef} = usePlaybackContext();

    const onSliderLayout = useCallback((event: LayoutChangeEvent) => {
        setSliderHeight(event.nativeEvent.layout.height);
    }, []);

    const changeVolumeOnPan = useCallback(
        (event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload & PanGestureChangeEventPayload>) => {
            const val = NumberUtils.roundToTwoDecimalPlaces(1 - event.y / sliderHeight);
            volume.value = NumberUtils.clamp(val, 0, 1);

            runOnJS(updateVolume)(volume.value);

            if((isMuted && volume.value > 0) || !isMuted && volume.value <= 0){
                pressVolumeIcon()
            }else {
                runOnJS(updateIcon)(isMuted ? 0 : volume.value);
            }
        },
        [sliderHeight, volume, isMuted],
    );

    const pan = Gesture.Pan()
        .onBegin((event) => {
            runOnJS(setIsSliderBeingUsed)(true);
            changeVolumeOnPan(event);
        })
        .onChange((event) => {
            changeVolumeOnPan(event);
        })
        .onFinalize(() => {
            runOnJS(setIsSliderBeingUsed)(false);
        });

    const progressBarStyle = useAnimatedStyle(() => ({height: `${volume.value * (isMuted ? 0 : 100)}%`}), [isMuted]);

    const updateIcon = useCallback((vol: number) => {
        setVolumeIcon({icon: getVolumeIcon(vol)});
    }, []);

    const pressVolumeIcon = ()=> {
        updateIcon(!isMuted ? 0 : volume.value)
        currentVideoPlayerRef.current.setStatusAsync({isMuted: !isMuted });
        setIsMuted(!isMuted)
    }

    return (
        <Hoverable>
            {(isHovered) => (
                <Animated.View style={[{cursor: isSliderBeingUsed ? 'grabbing' : 'pointer'}, style]}>
                    {(isSliderBeingUsed || isHovered) && (
                        <View style={[styles.volumeSliderContainer]}>
                            <GestureDetector gesture={pan}>
                                <View style={styles.ph2}>
                                    <View
                                        style={[styles.volumeSliderOverlay]}
                                        onLayout={onSliderLayout}
                                    >
                                        <View style={styles.volumeSliderThumb} />
                                        <Animated.View style={[styles.volumeSliderFill, progressBarStyle]} />
                                    </View>
                                </View>
                            </GestureDetector>
                        </View>
                    )}

                    <IconButton
                        tooltipText={volume.value === 0 ? translate('videoPlayer.unmute') : translate('videoPlayer.mute')}
                        onPress={pressVolumeIcon}
                        src={volumeIcon.icon}
                        small={small}
                        shouldForceRenderingTooltipBelow
                    />
                </Animated.View>
            )}
        </Hoverable>
    );
}

VolumeButton.displayName = 'VolumeButton';

export default memo(VolumeButton);
