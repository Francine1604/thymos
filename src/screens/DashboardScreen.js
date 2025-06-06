import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
  const { loading, entries, getMoodData, getEntryCountByWeekday } = useApp();
  
  // Skip rendering charts if no entries
  const hasEntries = entries.length > 0;
  
  // Current month and year for the header
  const currentDate = new Date();
  const currentMonthYear = format(currentDate, 'MMMM yyyy');
  
  // Previous month for comparison
  const previousMonth = subMonths(currentDate, 1);
  const prevMonthYear = format(previousMonth, 'MMMM yyyy');
  
  // Get mood distribution data for pie chart
  const moodData = React.useMemo(() => {
    if (!hasEntries) return [];
    
    return getMoodData().map(mood => ({
      name: mood.label,
      count: mood.count,
      color: mood.color,
      emoji: mood.emoji,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  }, [hasEntries, getMoodData, entries]);
  
  // Get weekday distribution data for bar chart
  const weekdayData = React.useMemo(() => {
    if (!hasEntries) return { labels: [], datasets: [{ data: [] }] };
    
    const data = getEntryCountByWeekday();
    return {
      labels: data.map(day => day.name.substring(0, 3)),
      datasets: [
        {
          data: data.map(day => day.count || 0),
        },
      ],
    };
  }, [hasEntries, getEntryCountByWeekday, entries]);
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  // Calculate streak and stats
  const stats = React.useMemo(() => {
    if (!hasEntries) {
      return { total: 0, thisMonth: 0, streak: 0 };
    }
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    const total = entries.length;
    
    // Count entries from current month
    const thisMonth = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return (
        entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear()
      );
    }).length;
    
    // Calculate streak (consecutive days with entries)
    let streak = 0;
    let currentStreak = 0;
    
    // Map of dates that have entries
    const datesWithEntries = new Set();
    entries.forEach(entry => {
      const dateStr = entry.timestamp.split('T')[0];
      datesWithEntries.add(dateStr);
    });
    
    // Start from today and go backwards to find streak
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (datesWithEntries.has(dateStr)) {
        currentStreak++;
      } else {
        // Break on first day without entries
        break;
      }
      
      // Go back one day
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    streak = currentStreak;
    return { total, thisMonth, streak };
  }, [entries, hasEntries, currentDate]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Journal Stats</Text>
        <Text style={styles.subtitle}>{currentMonthYear}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
      
      {!hasEntries ? (
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyStateText}>No journal data yet</Text>
          <Text style={styles.emptyStateSubText}>
            Start journaling to see your mood trends and patterns
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEntry')}
          >
            <Text style={styles.addButtonText}>Write First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Mood Distribution</Text>
            <View style={styles.moodChartWrapper}>
              <PieChart
                data={moodData}
                width={screenWidth - 32}
                height={200}
                chartConfig={chartConfig}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            
            <View style={styles.moodLegend}>
              {moodData.map((mood, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: mood.color }]} />
                  <Text style={styles.legendEmoji}>{mood.emoji}</Text>
                  <Text style={styles.legendText}>{mood.name}: {mood.count}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Journal Activity by Day</Text>
            <View style={styles.barChartContainer}>
              <BarChart
                data={weekdayData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                style={styles.barChart}
                fromZero
                showValuesOnTopOfBars
              />
            </View>
          </View>
          
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Your Journal Insights</Text>
            <View style={styles.insightCard}>
              <Ionicons name="trending-up" size={24} color="#10b981" style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>
                  {stats.thisMonth > 0 ? 
                    `You've made ${stats.thisMonth} entries this month.` : 
                    'Start your journaling habit this month!'}
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <Ionicons name="calendar" size={24} color="#6366f1" style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>
                  {stats.streak > 0 ? 
                    `You're on a ${stats.streak} day streak. Keep it up!` :
                    'Write today to start a new streak!'}
                </Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <Ionicons name="happy" size={24} color="#fbbf24" style={styles.insightIcon} />
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>
                  {hasEntries ? 
                    `Your most common mood is ${moodData.sort((a, b) => b.count - a.count)[0]?.name || 'Okay'}.` :
                    'Track your moods to see patterns over time.'}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
      
      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#6366f1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4338ca',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  moodChartWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  barChartContainer: {
    alignItems: 'center',
    paddingRight: 16, 
    overflow: 'hidden', 
  },
  moodLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 10,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  legendEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#4b5563',
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  insightIcon: {
    marginRight: 14,
  },
  insightContent: {
    flex: 1,
    justifyContent: 'center',
  },
  insightText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  footer: {
    height: 80, 
  },
});

export default DashboardScreen;