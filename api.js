import axios from 'axios';
import { FileSystem } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchData = async (onProgress) => {

    try {
        const [response1, response2] = await Promise.all([
            axios.get('https://arubiana.com/api'),
            axios.get('https://arubiana.com/api-2')
        ]);

        await AsyncStorage.multiSet([
            ['poi', JSON.stringify(response1.data)],
            ['otherData', JSON.stringify(response2.data)]
        ]);

        // Download images
        const imageUrls = response1.data.reduce((urls, poi) => {
            console.log(urls);
            console.log('-');
            console.log(poi);
            const imageUrls = [];

            if (poi.images && poi.images.image) {
                imageUrls.push(...poi.images.image.map((img) => img.url));
            }

            if (poi.image_thumb) {
                imageUrls.push(poi.image_thumb);
            }

            if (poi.image_map_point_thumb) {
                imageUrls.push(poi.image_map_point_thumb);
            }

            return [...urls, ...imageUrls];
        }, []);

        const imageDownloads = imageUrls.map(async (imageUrl) => {
            const imageKey = imageUrl.split('/').slice(-1)[0];
            console.log(imageKey);
            const imagePath = `${FileSystem.documentDirectory}${imageKey}`;
            const response = await axios.get(imageUrl, { responseType: 'blob' });
            console.log(response);
            await FileSystem.writeAsStringAsync(
                imagePath,
                response.data,
                { encoding: FileSystem.EncodingType.Base64 }
            );

            // Update the progress
            const currentProgress = imageDownloads.indexOf(imageUrl) / imageDownloads.length;
            onProgress(currentProgress);
        });

        await Promise.all(imageDownloads);

        return response1.data;
    } catch (error) {
        console.log(error);
    }
};
