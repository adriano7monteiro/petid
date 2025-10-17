import React from 'react';
import { View, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';

export default function ChartView({ data }){
  return (
    <View style={{ backgroundColor:'#fff', borderRadius:16, padding:12, marginVertical:8 }}>
      <Text style={{ fontWeight:'600', marginBottom:8 }}>Evolução (Apetite/Energia)</Text>
      <VictoryChart theme={VictoryTheme.material}>
        <VictoryLine data={data} />
      </VictoryChart>
    </View>
  );
}