import { supabase } from '../lib/supabaseClient';

async function listProperties() {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*');

    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }

    console.log('Properties:');
    console.table(properties);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listProperties();
