import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

type ReviewPageNavigationProp = NavigationProp<RootStackParamList, 'ReviewPage'>;

interface Hospital {
  place_id: string;
  name: string;
  vicinity: string;
  roadDistance?: string;
  phoneNumber?: string;
  openingHours?: {
    openNow: boolean;
    weekdayText?: string[];
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface ModalProps {
  selectedHospital: Hospital | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const HospitalDetailsModal: React.FC<ModalProps> = ({
  selectedHospital,
  modalVisible,
  setModalVisible,
}) => {
  
  const navigation = useNavigation<ReviewPageNavigationProp>();

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Google Maps is not available on this device.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open Google Maps.'));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedHospital ? (
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
              <Text style={styles.modalText}>ස්ථානය: {selectedHospital.vicinity}</Text>
              <Text style={styles.modalText}>දුර: {selectedHospital.roadDistance || 'N/A'}</Text>
              <Text style={styles.modalText}>දුරකත අංකය: {selectedHospital.phoneNumber || 'N/A'}</Text>
              <Text style={styles.modalText}>
              විවෘතයි : {selectedHospital.openingHours?.openNow ? 'ඔව්' : 'නැත'}
              </Text>

              {selectedHospital.openingHours?.weekdayText ? (
                <View style={styles.hoursContainer}>
                  <Text style={styles.hoursTitle}>විවෘතව ඇති වේලාවන්:</Text>
                  {selectedHospital.openingHours.weekdayText.map((day, index) => (
                    <View key={index} style={styles.hoursRow}>
                      <Text style={styles.dayText}>{day.split(': ')[0]}:</Text>
                      <Text style={styles.hoursText}>{day.split(': ')[1]}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.modalText}>Hours: N/A</Text>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() =>
                  openInGoogleMaps(
                    selectedHospital.geometry.location.lat,
                    selectedHospital.geometry.location.lng
                  )
                }
              >
                <Text style={styles.modalButtonText}>Google සිතියම</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalreviewButton}
                onPress={() => navigation.navigate('ReviewPage', { hospital: selectedHospital })}
              >
                <Text style={styles.modalButtonText}>සටහන්</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>පෙර පිටුවට</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Text style={styles.modalText}>රෝහලක් තෝරා නැත.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalreviewButton:{
    backgroundColor: '#22b241',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#4dd0e1',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#ff7043',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  hoursContainer: {
    width: '100%',
    marginTop: 10,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  hoursText: {
    fontSize: 16,
    color: '#555',
  },
});

export default HospitalDetailsModal;
