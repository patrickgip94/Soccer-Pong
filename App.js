import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { 
  Easing,
  useAnimatedStyle, 
  useSharedValue,
  withTiming, 
} from 'react-native-reanimated';

const FPS = 60;
const DELTA = 1000 / FPS;
const SPEED = 5;
const BALL_WIDTH = 25;

const islandDimensions = {x: 100, y: 200, w: 200, h: 40};

const normalizeVector = (vector) => {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  return ({
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  })
}

export default function App() {
  const { height, width } = useWindowDimensions();
  const targetPositionX = useSharedValue(width / 2);
  const targetPositionY = useSharedValue(height / 2);
  const direction = useSharedValue(
    normalizeVector({ x: Math.random(), y: Math.random() })
  );


  useEffect(() => {
    const interval = setInterval(update, DELTA);

    return () => clearInterval(interval); // This prevents any memory leaks 
  }, []);

  const update = () => {
    let nextPos = getNextPos(direction.value);
    

    if (nextPos.y < 0 || nextPos.y > height - BALL_WIDTH) {
      const newDirection = {x: direction.value.x, y: -direction.value.y }
      direction.value = newDirection;
      nextPos = getNextPos(newDirection);
    }

    if (nextPos.x < 0 || nextPos.x > width - BALL_WIDTH) {
      const newDirection = {x: -direction.value.x, y: direction.value.y };
      direction.value = newDirection;
      nextPos = getNextPos(newDirection);
    }

    if (
      nextPos.x < islandDimensions.x + islandDimensions.w &&
      nextPos.x + BALL_WIDTH > islandDimensions.x &&
      nextPos.y < islandDimensions.y + islandDimensions.h &&
      BALL_WIDTH + nextPos.y > islandDimensions.y 
    ) {
      console.log("Touched the side of the boba");
      const newDirection = {x: direction.value.x, y: -direction.value.y }
      direction.value = newDirection;
      nextPos = getNextPos(newDirection);
    }

    // if (
    //   nextPos.y < islandDimensions.y + islandDimensions.h &&
    //   BALL_WIDTH + nextPos.y > islandDimensions.y
    // ) {
    //   console.log("Touched the top/bottom of the boba");
    //   const newDirection = {x: -direction.value.x, y: direction.value.y }
    //   direction.value = newDirection;
    //   nextPos = getNextPos(newDirection);
    // } else {

    // }

    targetPositionX.value = withTiming( nextPos.x , { 
      duration: DELTA,
      easing: Easing.linear, 
    });
    targetPositionY.value = withTiming( nextPos.y , { 
      duration: DELTA,
      easing: Easing.linear, 
    });
  };

  const getNextPos = ( direction ) => {

    return {
      x: targetPositionX.value + direction.x * SPEED,
      y: targetPositionY.value + direction.y * SPEED,
    }
  }

  const ballAnimatedStyles = useAnimatedStyle(() => {
    return {
      top: targetPositionY.value,
      left: targetPositionX.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ball, ballAnimatedStyles]}>
        <View style={{
          backgroundColor: "red", 
          position: "absolute", 
          width: "100%", 
          height: "100%"}} 
        />
      </Animated.View>
        <Image 
          source={{uri: "https://i.imgur.com/sJi5otw.png"}} 
          alt="" 
          style={{
            top: islandDimensions.y,
            left: islandDimensions.x,
            position: "absolute",
            width: islandDimensions.w, 
            height: islandDimensions.h,
          }}
        />


      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    backgroundColor: "#503c3c",
    width: BALL_WIDTH,
    aspectRatio: 1,
    borderRadius: 25,
    position: 'absolute',

  }
});
