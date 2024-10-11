import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Path to your Firebase config
import { auth } from '../../config/FirebaseConfig';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import Footer from '../../layouts/Footer'

type ReviewNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const ReviewPage: React.FC = () => {
  const [review, setReview] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]); // State to store reviews

  const route = useRoute();
  const { hospital } = route.params as { hospital: { name: string } };
  const navigation = useNavigation<ReviewNavigationProp>();

  useEffect(() => {
    fetchReviews();
  }, []);

  // Function to fetch reviews from Firestore
  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('hospitalName', '==', hospital.name));
      const querySnapshot = await getDocs(q);
      const fetchedReviews: any[] = [];
      const user = auth.currentUser;

      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ ...doc.data(), id: doc.id });
      });

      // Separate the current user's reviews and other reviews
      const userReviews = fetchedReviews.filter(item => item.userName === user?.email);
      const otherReviews = fetchedReviews.filter(item => item.userName !== user?.email);

      // Combine them so user reviews appear last
      setReviews([...otherReviews, ...userReviews]);
    } catch (error) {
      console.error('Error fetching reviews: ', error);
      Alert.alert('Error', 'Failed to fetch reviews.');
    }
  };

  const submitReview = async () => {
    if (!review) {
      Alert.alert('Error', 'Please write a review.');
      return;
    }

    const user = auth.currentUser;

    if (user) {
      try {
        const reviewData = {
          hospitalName: hospital.name,
          userName: user.email || 'Anonymous',
          review: review,
          timestamp: new Date(),
        };

        await setDoc(doc(db, 'reviews', `${hospital.name}-${user.uid}`), reviewData);
        Alert.alert('සටහන ඇතුලත් කිරීම සාර්ථකයි');
        setReview(''); // Clear the input field
        fetchReviews(); // Refresh the reviews after adding
      } catch (error) {
        Alert.alert('Error', 'Failed to submit review.');
      }
    } else {
      Alert.alert('Error', 'User not authenticated.');
    }
  };

  // Function to delete a review
  const deleteReview = async (id: string) => {
    const user = auth.currentUser;

    if (user) {
      try {
        await deleteDoc(doc(db, 'reviews', id)); // Delete review from Firestore
        Alert.alert('Success', 'Review deleted!');
        fetchReviews(); // Refresh the reviews after deleting
      } catch (error) {
        Alert.alert('Error', 'Failed to delete review.');
      }
    } else {
      Alert.alert('Error', 'User not authenticated.');
    }
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.reviewContainer}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.reviewText}>{item.review}</Text>
      {auth.currentUser && item.userName === auth.currentUser.email && ( // Check if the review belongs to the current user
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteReview(item.id)}>
          <Text style={styles.deleteButtonText}>මකන්න </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.reviewTitle}>සටහන් :</Text>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewList}
      />
      <Text style={styles.title}>{hospital.name}</Text>
      <TextInput
        style={styles.input}
        placeholder="ඔබේ සටහන මෙහි තබන්න"
        value={review}
        onChangeText={setReview}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={submitReview}>
        <Text style={styles.buttonText}>ඇතුලත් කරන්න </Text>
      </TouchableOpacity>

      

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9', // Light gray background
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    marginBottom:50
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  reviewList: {
    marginTop: 10,
  },
  reviewContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0', // Light background for reviews
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 5,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
 
});

export default ReviewPage;
