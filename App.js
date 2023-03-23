import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Progress from 'react-native-progress';
import { fetchData } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function App() {

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    async function getData() {
      try {
        const storedData = await AsyncStorage.getItem('poi');
        if (storedData !== null) {
          console.log('Data found in local storage');
          setData(JSON.parse(storedData));
        } else {
          setIsLoading(true);
          const fetchedData = await fetchData((progress) => setProgress(progress));
          setData(fetchedData);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    }

    getData();
  }, []);



  return (
      <View style={styles.container}>
        {isLoading ? (
            <>
              <Text>Loading data...</Text>
              <Progress.Bar progress={progress} width={200} />
            </>
        ) : (
            <>
              {data ? (
                  <>
                    <Text>Data:</Text>
                    <Text>{JSON.stringify(data)}</Text>
                  </>
              ) : (
                  <Text>No data found.</Text>
              )}
            </>
        )}
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
});
