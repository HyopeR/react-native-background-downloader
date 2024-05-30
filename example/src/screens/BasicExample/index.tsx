import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import RNFS from 'react-native-fs';
import {
  DownloadTask,
  completeHandler,
  directories,
  checkForExistingDownloads,
  download,
  setConfig,
} from '@kesha-antonov/react-native-background-downloader';
import Slider from '@react-native-community/slider';
import {ExButton, ExWrapper} from '../../components/commons';
import {toast, uuid} from '../../utils';
import {Footer} from './Footer';

const defaultDir = directories.documents;
const testDir = `${defaultDir}/test`;

setConfig({
  isLogsEnabled: false,
});

const BasicExampleScreen = () => {
  const [urlList] = useState([
    {
      id: uuid(),
      url: 'https://sabnzbd.org/tests/internetspeed/20MB.bin',
    },
    {
      id: uuid(),
      url: 'https://sabnzbd.org/tests/internetspeed/50MB.bin',
    },
    {
      id: uuid(),
      url: 'https://proof.ovh.net/files/100Mb.dat',
    },
  ]);

  const [isStarted, setIsStarted] = useState(false);

  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([]);

  /**
   * It is used to resume your incomplete or unfinished downloads.
   */
  const resumeExistingTasks = async () => {
    try {
      const tasks = await checkForExistingDownloads();

      console.log(tasks);

      if (tasks.length > 0) {
        tasks.map(task => process(task));
        setDownloadTasks(_downloadTasks => [..._downloadTasks, ...tasks]);
        setIsStarted(true);
      }
    } catch (e) {
      console.warn('checkForExistingDownloads e', e);
    }
  };

  const readStorage = async () => {
    const files = await RNFS.readdir(defaultDir);
    toast('Check logs');
    console.log(`Downloaded path: ${defaultDir}`);
    console.log(`Downloaded files: ${files}`);
  };

  const clearStorage = async () => {
    const files = await RNFS.readdir(defaultDir);

    if (files.length > 0) {
      await Promise.all(
        files.map(file => RNFS.unlink(defaultDir + '/' + file)),
      );
    }

    toast('Check logs');
    console.log(`Deleted file count: ${files.length}`);
  };

  const process = (task: DownloadTask) => {
    const {index} = getTask(task.id);

    return task
      .begin(({expectedBytes, headers}) => {
        console.log('task: begin', {id: task.id, expectedBytes, headers});
        setDownloadTasks(_downloadTasks => {
          _downloadTasks[index] = task;
          return [..._downloadTasks];
        });
      })
      .progress(({bytesDownloaded, bytesTotal}) => {
        console.log('task: progress', {
          id: task.id,
          bytesDownloaded,
          bytesTotal,
        });
        setDownloadTasks(_downloadTasks => {
          _downloadTasks[index] = task;
          return [..._downloadTasks];
        });
      })
      .done(() => {
        console.log('task: done', {id: task.id});
        setDownloadTasks(_downloadTasks => {
          _downloadTasks[index] = task;
          return [..._downloadTasks];
        });

        completeHandler(task.id);
      })
      .error(e => {
        console.error('task: error', {id: task.id, e});
        setDownloadTasks(_downloadTasks => {
          _downloadTasks[index] = task;
          return [..._downloadTasks];
        });

        completeHandler(task.id);
      });
  };

  const reset = () => {
    stop();
    setDownloadTasks([]);
    setIsStarted(false);
  };

  const start = () => {
    /**
     * You need to provide the extension of the file in the destination section below.
     * If you cannot provide this, you may experience problems while using your file.
     * For example; Path + File Name + .png
     */
    const taskAttributes = urlList.map(item => {
      const destination = defaultDir + '/' + item.id;
      return {
        id: item.id,
        url: item.url,
        destination: destination,
      };
    });

    const tasks = taskAttributes.map(taskAttribute =>
      process(download(taskAttribute)),
    );

    setDownloadTasks(_downloadTasks => [..._downloadTasks, ...tasks]);
    setIsStarted(true);
  };

  const stop = () => {
    const tasks = downloadTasks.map(task => {
      task.stop();
      return task;
    });

    setDownloadTasks(tasks);
    setIsStarted(false);
  };

  const pause = (id: string) => {
    const {index, task} = getTask(id);

    task.pause();
    setDownloadTasks(_downloadTasks => {
      _downloadTasks[index] = task;
      return [..._downloadTasks];
    });
  };

  const resume = (id: string) => {
    const {index, task} = getTask(id);

    task.resume();
    setDownloadTasks(_downloadTasks => {
      _downloadTasks[index] = task;
      return [..._downloadTasks];
    });
  };

  const cancel = (id: string) => {
    const {index, task} = getTask(id);

    task.stop();
    setDownloadTasks(_downloadTasks => {
      _downloadTasks[index] = task;
      return [..._downloadTasks];
    });
  };

  const getTask = (id: string) => {
    const index = downloadTasks.findIndex(task => task.id === id);
    const task = downloadTasks[index];
    return {index, task};
  };

  useEffect(() => {
    resumeExistingTasks();
  }, []);

  return (
    <ExWrapper>
      <Text style={styles.title}>Basic Example</Text>
      <View style={{flex: 1}}>
        <FlatList
          data={urlList}
          keyExtractor={(item, index) => `url-${index}`}
          renderItem={({item}) => (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text>Id: {item.id}</Text>
                <Text>Url: {item.url}</Text>
              </View>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.footer}>
              <Footer
                isStarted={isStarted}
                onStart={start}
                onStop={stop}
                onReset={reset}
                onClear={clearStorage}
                onRead={readStorage}
              />
            </View>
          )}
        />
      </View>

      <FlatList
        style={{flex: 1}}
        data={downloadTasks}
        renderItem={({item}) => {
          const isEnded = ['STOPPED', 'DONE', 'FAILED'].includes(item.state);
          const isDownloading = item.state === 'DOWNLOADING';

          return (
            <View style={styles.item}>
              <View style={styles.itemContent}>
                <Text>{item?.id}</Text>
                <Text>{item?.state}</Text>
                <Slider
                  disabled={true}
                  value={item?.bytesDownloaded}
                  minimumValue={0}
                  maximumValue={item?.bytesTotal}
                />
              </View>
              <View>
                {!isEnded &&
                  (isDownloading ? (
                    <ExButton title={'Pause'} onPress={() => pause(item.id)} />
                  ) : (
                    <ExButton
                      title={'Resume'}
                      onPress={() => resume(item.id)}
                    />
                  ))}
                <ExButton title={'Cancel'} onPress={() => cancel(item.id)} />
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => `task-${index}`}
      />
    </ExWrapper>
  );
};

const styles = StyleSheet.create({
  footer: {
    padding: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  item: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    flexShrink: 1,
  },
});

export default BasicExampleScreen;
