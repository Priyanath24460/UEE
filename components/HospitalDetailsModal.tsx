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
      .catch((err) => Alert.alert('Error', 'Failed to open Google Maps.'));
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
              <Text style={styles.modalText}>Vicinity: {selectedHospital.vicinity}</Text>
              <Text style={styles.modalText}>Distance: {selectedHospital.roadDistance || 'N/A'}</Text>
              <Text style={styles.modalText}>Contact: {selectedHospital.phoneNumber || 'N/A'}</Text>
              <Text style={styles.modalText}>
                Open Now: {selectedHospital.openingHours?.openNow ? 'Yes' : 'No'}
              </Text>
              
              {/* Table-like view for opening hours */}
              {selectedHospital.openingHours?.weekdayText ? (
                <View style={styles.hoursContainer}>
                  <Text style={styles.hoursTitle}>Opening Hours:</Text>
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
                <Text style={styles.modalButtonText}>Open in Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Text style={styles.modalText}>No hospital selected.</Text>
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
    maxHeight: '80%', // Limit the height of the modal to prevent overflow
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

  reviewItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  reviewAuthor: {
    fontWeight: 'bold',
  },
});

export default HospitalDetailsModal;
