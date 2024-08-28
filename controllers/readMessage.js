const mongoose = require('mongoose');

const ReadMessage = (MessagesScheme) => async (req, res) => {
  const { MessageId, userId } = req.body;

  try {
    const _messageId = new mongoose.Types.ObjectId(MessageId);
    const _userId = new mongoose.Types.ObjectId(userId);

    // Find the document containing the message
    const document = await MessagesScheme.findOne({ 'messages._id': _messageId }).populate('messages.sender').populate('messages.recipient');

    if (!document) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Find the index of the message in the array
    const messageIndex = document.messages.findIndex(message => message._id.equals(_messageId));

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found in document' });
    }

    // Update the read field of the specific message
    document.messages[messageIndex].read = true;

    // Save the updated document
    await document.save();

    // Return only the updated message
    const updatedMessage = document.messages[messageIndex];

    res.json(updatedMessage);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = ReadMessage;
