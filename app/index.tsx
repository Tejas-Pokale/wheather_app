import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Dimensions,
  StatusBar,
} from "react-native";
import { Appbar, Avatar, Button, Icon, IconButton } from "react-native-paper";
import axios from "axios";
import * as Location from "expo-location";

// OpenWeather API key (replace with your actual API key)
const API_KEY = "PLACE_YOUR_API_KEY";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  ); // User's current location
  const [weather, setWeather] = useState<any | null>(null); // Weather data
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [search, setSearch] = useState(""); // City search input
  const [error, setError] = useState<String | null>(null); // Error handling

  const dimension = Dimensions.get("window");

  // Fetch user's location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to fetch weather data."
        );
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log(currentLocation);
      setLocation(currentLocation);
      fetchWeather(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    };

    fetchLocation();
  }, []);

  // Fetch weather data using OpenWeather API
  const fetchWeather = async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      console.log(response.data);
      setWeather(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to fetch weather data. ${err}`);
      setIsLoading(false);
    }
  };

  // Fetch weather by city name
  const handleSearch = async () => {
    if (!search) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${API_KEY}&units=metric`
      );
      console.log(response.data);
      setWeather(response.data);
      setIsLoading(false);
      setSearch("");
    } catch (err) {
      setError("Failed to fetch weather for the city.");
      setIsLoading(false);
    }
  };

  // Render the weather information
  const renderWeather = () => {
    if (!weather) return null;

    return (
      <View className="flex justify-center items-center mt-6 bg-gray-500/25 rounded-lg p-6">
        <Text className="text-2xl font-bold color-white">{weather.name}</Text>
        <Text className="text-5xl font-bold text-teal-600">
          {weather.main.temp}°C
        </Text>
        <Text className="text-lg text-gray-50 capitalize">
          {weather.weather[0].description}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor={"transparent"}
      />
      <ImageBackground
        source={require("../assets/images/image1.jpg")}
        style={{ width: dimension.width, height: "100%" }}
      >
        <View className="mt-3 p-5 w-screen flex-row justify-between items-center ">
          <Avatar.Text size={40} label="XD" />
          <Text className="color-white font-bold text-xl w-35 text-center">Wheather finder</Text>
          <IconButton
            icon="dots-vertical" // Icon name
            iconColor="white" // Icon color
            size={30} // Icon size
            onPress={() => console.log("Heart button pressed")}
            className="ml-7"
          />
        </View>

        <View className="flex-1 justify-center items-center p-4 gap-4">
          {isLoading && <ActivityIndicator size="large" color="#16a085" />}
          {error && <Text className="text-red-500 text-lg mt-2">{error}</Text>}

          {!isLoading && weather && renderWeather()}

          <TextInput
            placeholder="Enter City Name"
            placeholderTextColor={"white"}
            value={search}
            onChangeText={setSearch}
            className="border border-gray-300 rounded-md w-3/4 p-3 text-center mt-4 text-white font-bold"
          />
          <Button
            mode="contained"
            onPress={handleSearch}
            className="mt-3 bg-teal-500"
            labelStyle={{ color: "white" }}
          >
            Search
          </Button>

          {location && (
            <Button
              mode="outlined"
              onPress={() =>
                fetchWeather(
                  location.coords.latitude,
                  location.coords.longitude
                )
              }
              className="mt-3 border border-teal-500"
              labelStyle={{ color: "#16a085" }}
            >
              Refresh Current Location
            </Button>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}
