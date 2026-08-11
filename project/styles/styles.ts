import { StyleSheet } from 'react-native'

export const appStyles = StyleSheet.create({

  container: {
    marginTop: 40,
    padding: 12,
    },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  // --- Typography ---
  titleLogo: {
    fontFamily: 'Caveat-Regular',
    fontSize: 64,
    color: '#37423D',
  },
  titleHeadline1: {
    fontFamily: 'Caveat-Regular',
    fontSize: 40,
    color: '#37423D',
  },
  titleHeadline2: {
    fontFamily: 'Caveat-Regular',
    fontSize: 34,
    color: '#37423D',
  },
  titleHeadline3: {
    fontFamily: 'Caveat-Regular',
    fontSize: 28,
    color: '#37423D',
  },
  titleHeadline4: {
    fontFamily: 'Caveat-Regular',
    fontSize: 18,
    color: '#37423D',
  },
  titleParagraph: {
    fontFamily: 'Caveat-Regular',
    fontSize: 14,
    color: '#37423D',
  },
  subtitleHeadline1: {
    fontFamily: 'Raleway-Regular',
    fontSize: 40,
    color: '#37423D',
  },
  subtitleHeadline2: {
    fontFamily: 'Raleway-Regular',
    fontSize: 34,
    color: '#37423D',
  },
  subtitleHeadline3: {
    fontFamily: 'Raleway-Regular',
    fontSize: 28,
    color: '#37423D',
  },
  subtitleHeadline4: {
    fontFamily: 'Raleway-Regular',
    fontSize: 18,
    color: '#37423D',
  },
  subtitleParagraph: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#37423D',
  },
  bodyHeadline1: {
    fontFamily: 'Harmattan-Regular',
    fontSize: 40,
    color: '#37423D',
  },
  bodyHeadline2: {
    fontFamily: 'Harmattan-Regular',
    fontSize: 34,
    color: '#37423D',
  },
  bodyHeadline3: {
    fontFamily: 'Harmattan-Regular',
    fontSize: 28,
    color: '#37423D',
  },
  bodyHeadline4: {
    fontFamily: 'Harmattan-Regular',
    fontSize: 18,
    color: '#37423D',
  },
  bodyParagraph: {
    fontFamily: 'Harmattan-Regular',
    fontSize: 14,
    color: '#37423D',
  },
    label: {
        fontFamily: 'Raleway-Medium',
        fontSize: 16,
        color: '#86939e',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#86939e',
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: '#f2f2f2',
        borderColor: '#d1d1d1',
        color: '#9e9e9e',
    },
    button: {
      backgroundColor: '#899878',
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    avatar: {
        borderRadius: 5,
        overflow: 'hidden',
        maxWidth: '100%',
        marginBottom: 20,
    },
    image: {
        objectFit: 'cover',
        paddingTop: 0,
    },
    noImage: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgb(200, 200, 200)',
        borderRadius: 5,
    },
    backgroundColor: {
        flex: 1,
        backgroundColor: '#FCF9ED',
    },
    welcomeBlock: {
        flex: 1,
        backgroundColor: '#DDE7C7',
    },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#FCF9ED',
    // justifyContent: 'center',
    // alignItems:'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  // --- Profile Page Styles ---
  profileContainer: {
    // backgroundColor: '#06d6a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContainer: {
    // backgroundColor: '#ffd166',
    paddingHorizontal: 14,
    paddingVertical: 22,
  },
  accountContainer: {
    // backgroundColor: '#4361ee',
    gap: 10,
    paddingBottom: 20,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  settingRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#918E8E',
  },
  myPlantContainer: {
    // backgroundColor: '#4cc9f0',
    gap: 10,
    paddingBottom: 20,

  },
  socialContainer: {
    // backgroundColor: '#f72585',
    gap: 10,
    paddingBottom: 20,
  },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#899878',
    marginTop: 71,
  },
  profileCircle2: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#899878',
    // marginTop: 71,
  },
  profileStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 25,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  streakContainer: {
    outlineStyle: 'solid',
    outlineColor: '#37423D',
    outlineWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    borderRadius: 40,
    paddingHorizontal: 12,
  },
  statsContainer: {
    backgroundColor: '#B9CCA4',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    borderRadius: 40,
    paddingHorizontal: 12,
  },
  friendsContainer: {
    outlineStyle: 'solid',
    outlineColor: '#37423D',
    outlineWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    borderRadius: 40,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // ------------------------------------
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 70,
  },
  screenContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  userInputEmail: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 15,
  },
  gardenerPicker: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  gardenerOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gardenerOption: {
    width: 115,
    height: 115,
  },
  saveButton: {
    backgroundColor: '#DDE7C7',
    borderRadius: 20,
    width: 250,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  speciesOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
    speciesOption: {
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    outlineStyle: 'solid',
    outlineColor: '#37423D',
    outlineWidth: 1,
  },
  // ------- Log Out Component -------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FCF9ED',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
 modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  modalCloseButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: 'Raleway-Bold',
    fontSize: 20,
    color: '#e63946',
    textAlign: 'center',
  },
  modalQuestion: {
    fontFamily: 'Raleway-Bold',
    fontSize: 18,
    color: '#37423D',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#918E8E',
    textAlign: 'center',
    marginBottom: 28,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#37423D',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 16,
    color: '#37423D',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#B9CCA4',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 16,
    color: '#37423D',
  },
  // ----------------------------------
  searchInputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 1,
  },
  searchInput: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    paddingLeft: 40,
  },
  friendsListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
})
