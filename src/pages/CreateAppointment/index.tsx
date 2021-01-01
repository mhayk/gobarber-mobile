import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Platform, Alert } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'

import {
  Container,
  Header,
  Content,
  BackButton,
  HeaderTitle,
  UserAvatar,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText
} from './styles';

import Icon from 'react-native-vector-icons/Feather'
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface RouteParams {
  providerId: string;
}
export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

export interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const {user } = useAuth()
  const route  = useRoute()
  const { goBack, navigate } = useNavigation()

  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedHour, setSelectedHour] = useState(0)
  const [providers, setProviders] = useState<Provider[]>([])
  const routeParams = route.params as RouteParams;
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId)

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data)
    })
  }, [])

  useEffect(() => {
    api.get(`/providers/${selectedProvider}/day-availability`, {
      params: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate()
      }
    }).then((response) => {
      setAvailability(response.data)
    })
  }, [selectedDate, selectedProvider])

  const navigateBack = useCallback(
    () => {
      goBack()
    },
    [goBack],
  )

  const handleSelectProvider = useCallback((providerId : string) => {
    setSelectedProvider(providerId)
  }, [])

  const handleToggleDatePicker = useCallback(() => { setShowDatePicker(state => !state)}, [])

  const handleDateChanged = useCallback((event: any, date: Date | undefined) => {
        if(Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date)
    }

  }, [])

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour)
  }, [])

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate)

      date.setHours(selectedHour)
      date.setMinutes(0)

      await api.post('appointments', {
        provider_id: selectedProvider,
        date
      })

      navigate('AppointmentCreated', { date: date.getTime()})
   } catch(err) {
     Alert.alert(
       'Error to create a new appointment',
       'A error happened was duringAn error occurred while trying to create the schedule, try again.'
       )
    }
  }, [navigate, selectedDate, selectedHour, selectedProvider])

  const morningAvailability = useMemo(() => {
    return availability.filter(({hour}) => hour < 12)
      .map(({hour, available}) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00')
        }
      })
  }, [availability])

  const afternoonAvailability = useMemo(() => {
    return availability.filter(({hour}) => hour >= 12)
      .map(({hour, available}) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00')
        }
      })
  }, [availability])

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack} >
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Hairdresses</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }}/>
      </Header>

      <Content>
        <ProvidersListContainer>
          <ProvidersList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={provider => provider.id}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                onPress={() => handleSelectProvider(provider.id)}
                selected={provider.id === selectedProvider}
              >
                <ProviderAvatar source={{ uri: provider.avatar_url}}/>
                <ProviderName selected={provider.id === selectedProvider}>{provider.name}</ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>

        <Calendar>
          <Title>Choose a date</Title>

          <OpenDatePickerButton onPress={handleToggleDatePicker}>
            <OpenDatePickerButtonText>Select date</OpenDatePickerButtonText>
          </OpenDatePickerButton>
          {
            showDatePicker && (
              <DateTimePicker
                mode="date"
                display="calendar"
                // textColor="#f4ede8"
                onChange={handleDateChanged}
                is24Hour
                value={selectedDate}
              />
            )
          }
        </Calendar>

        <Schedule>
          <Title>Choose a time</Title>

          <Section>
            <SectionTitle>Morning</SectionTitle>

            <SectionContent>
              {morningAvailability.map(({hourFormatted, hour, available}) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>{hourFormatted}</HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Afternoon</SectionTitle>

            <SectionContent>
              {afternoonAvailability.map(({hourFormatted, hour, available}) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>{hourFormatted}</HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Booking</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  )
}

export default CreateAppointment;
