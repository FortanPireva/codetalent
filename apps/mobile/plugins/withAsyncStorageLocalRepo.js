const { withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Expo config plugin that adds the @react-native-async-storage/async-storage
 * local maven repository to android/build.gradle.
 *
 * async-storage v3.x ships `storage-android:1.0.0` in a local_repo inside
 * the npm package. Gradle needs to know where to find it. This plugin injects
 * the repo into both allprojects and subprojects so it survives prebuild --clean.
 */
function withAsyncStorageLocalRepo(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addAsyncStorageRepo(
        config.modResults.contents
      );
    }
    return config;
  });
}

function addAsyncStorageRepo(buildGradle) {
  // Don't add twice
  if (buildGradle.includes("asyncStorageLocalRepo")) {
    return buildGradle;
  }

  const repoBlock = `
// [async-storage] Resolve local maven repo for storage-android:1.0.0
def asyncStorageLocalRepo = null
[
  new File(rootDir, "../node_modules/@react-native-async-storage/async-storage/android/local_repo"),
  new File(rootDir, "../../../../node_modules/@react-native-async-storage/async-storage/android/local_repo"),
  new File(rootDir, "../../../node_modules/@react-native-async-storage/async-storage/android/local_repo"),
].each { candidate ->
  if (asyncStorageLocalRepo == null && candidate.exists()) {
    asyncStorageLocalRepo = candidate
  }
}

subprojects { subproject ->
  subproject.afterEvaluate {
    if (asyncStorageLocalRepo != null) {
      subproject.repositories {
        maven { url asyncStorageLocalRepo.toURI() }
      }
    }
  }
}
`;

  // Inject the local repo into allprojects.repositories
  buildGradle = buildGradle.replace(
    /allprojects\s*\{\s*\n(\s*)repositories\s*\{/,
    `allprojects {\n$1repositories {\n$1  if (asyncStorageLocalRepo != null) { maven { url asyncStorageLocalRepo.toURI() } }`
  );

  // Add the resolution block + subprojects injection before allprojects
  buildGradle = buildGradle.replace(
    /allprojects\s*\{/,
    repoBlock + "\nallprojects {"
  );

  return buildGradle;
}

module.exports = withAsyncStorageLocalRepo;
