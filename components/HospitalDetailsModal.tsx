import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

// Define the type for the hospital
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
            <>
              <Text style={styles.modalTitle}>{selectedHospital.name}</Text>
              <Text style={styles.modalText}>Vicinity: {selectedHospital.vicinity}</Text>
              <Text style={styles.modalText}>Distance: {selectedHospital.roadDistance || 'N/A'}</Text>
              <Text style={styles.modalText}>Contact: {selectedHospital.phoneNumber || 'N/A'}</Text>
              <Text style={styles.modalText}>
                Open Now: {selectedHospital.openingHours?.openNow ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.modalText}>
                Hours: {selectedHospital.openingHours?.weekdayText?.join(', ') || 'N/A'}
              </Text>

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
            </>
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
});

export default HospitalDetailsModal;
